import {
  Amount,
  AssetAmount,
  LiquidityProvider,
  Network,
  Pool,
} from "@sifchain/sdk";
import { createPoolKey } from "@sifchain/sdk/src/utils";
import { dissoc } from "rambda";

import { Services } from "~/business/services";
import { Store } from "~/business/store";
import { AccountPool } from "~/business/store/pools";

type PickSif = Pick<Services["sif"], "getState">;
type PickClp = Pick<
  Services["clp"],
  | "getAccountLiquidityProviderData"
  | "getRawPools"
  | "getPmtpParams"
  | "GetSwapFeeParams"
>;

type PickChains = Pick<
  Services["chains"],
  "get" | "findChainAssetMatch" | "findChainAssetMatch"
>;

type PickTokenRegistry = Pick<Services["tokenRegistry"], "load">;

type SyncPoolsArgs = {
  sif: PickSif;
  clp: PickClp;
  chains: PickChains;
  tokenRegistry: PickTokenRegistry;
};

type SyncPoolsStore = Pick<Store, "accountpools" | "pools">;

export function SyncPools(
  { clp, chains, tokenRegistry }: SyncPoolsArgs,
  store: SyncPoolsStore,
) {
  return {
    syncPublicPools,
    syncUserPools,
  };

  async function syncPublicPools() {
    const nativeAsset = chains.get(Network.SIFCHAIN).nativeAsset;
    const registry = await tokenRegistry.load();

    const [rawPoolsRes, pmtpParamsRes, swapFeeParamsRes] = await Promise.all([
      clp.getRawPools(),
      clp.getPmtpParams(),
      clp.GetSwapFeeParams(),
    ]);

    const pools = rawPoolsRes.pools
      .map((pool) => {
        const externalSymbol = pool.externalAsset?.symbol;
        const entry = registry.find(
          (item) =>
            item.denom === externalSymbol || item.baseDenom === externalSymbol,
        );
        if (!entry) {
          console.warn("Could not find token in registry", {
            externalSymbol,
            pool,
          });
          return null;
        }

        const asset = chains
          .get(Network.SIFCHAIN)
          .findAssetWithLikeSymbol(entry.baseDenom);

        if (!asset) {
          console.warn("Could not find asset in chain", {
            asset: entry.baseDenom,
            externalSymbol,
          });
          return null;
        }

        const toNativeAmountDerived = (rawAmount: string) =>
          AssetAmount(nativeAsset, rawAmount).toDerived();

        const nativeAssetBalance = Amount(pool.nativeAssetBalance).add(
          pool.nativeLiabilities,
        );

        const externalAssetBalance = Amount(pool.externalAssetBalance).add(
          pool.externalLiabilities,
        );

        const poolDenom = pool.externalAsset?.symbol ?? "";

        const swapFeeRate =
          swapFeeParamsRes.tokenParams.find((x) => x.asset === poolDenom)
            ?.swapFeeRate ?? swapFeeParamsRes.defaultSwapFeeRate;

        return new Pool(
          AssetAmount(nativeAsset, nativeAssetBalance),
          AssetAmount(asset, externalAssetBalance),
          {
            poolUnits: Amount(pool.poolUnits),
            swapPrices: {
              native: toNativeAmountDerived(pool.swapPriceNative),
              external: toNativeAmountDerived(pool.swapPriceExternal),
            },
            swapFeeRate: toNativeAmountDerived(swapFeeRate),
            swapFeeTokenParams: swapFeeParamsRes.tokenParams,
            currentRatioShiftingRate: toNativeAmountDerived(
              pmtpParamsRes.pmtpRateParams?.pmtpCurrentRunningRate ?? "0",
            ),
            nativeLiabilities: AssetAmount(nativeAsset, pool.nativeLiabilities),
            externalLiabilities: AssetAmount(asset, pool.externalLiabilities),
            nativeCustody: AssetAmount(nativeAsset, pool.nativeCustody),
            externalCustody: AssetAmount(asset, pool.externalCustody),
          },
        );
      })
      .filter(Boolean) as Pool[];

    for (const pool of pools) {
      const key = pool.symbol();

      store.pools[key] = pool;
    }
  }

  async function syncUserPools(address: string) {
    const registry = await tokenRegistry.load();

    // This is a hot method when there are a heap of pools
    // Ideally we would have a better rest endpoint design
    const currentAccountPools: Record<string, AccountPool> = {};

    if (!store.accountpools[address]) {
      store.accountpools[address] = {};
    }

    const rawLpData = await clp.getAccountLiquidityProviderData({
      lpAddress: address,
    });

    rawLpData.forEach((lpItem) => {
      const symbol = lpItem.liquidityProvider?.asset?.symbol;
      if (!symbol) {
        return;
      }

      const entry = registry.find(
        ({ denom, baseDenom }) => denom === symbol || baseDenom === symbol,
      );

      if (!entry) {
        console.warn(
          `Could not find entry in tokenRegistry for symbol: ${symbol}`,
        );
        return;
      }

      const asset = chains
        .get(Network.SIFCHAIN)
        .findAssetWithLikeSymbol(entry.baseDenom);

      if (!asset) {
        console.warn(
          `Could not find asset in chain gonfig for baseDenom: ${entry.baseDenom}`,
        );
        return;
      }

      if (!lpItem.liquidityProvider) {
        throw new Error("Missing liquidity provider");
      }

      const pool = createPoolKey(
        asset,
        chains.get(Network.SIFCHAIN).nativeAsset,
      );

      const lp = new LiquidityProvider(
        asset,
        Amount(lpItem.liquidityProvider.liquidityProviderUnits),
        address,
        Amount(lpItem.nativeAssetBalance),
        Amount(lpItem.externalAssetBalance),
      );

      currentAccountPools[pool] = { lp, pool };
    });

    const poolIdsToRemove = Object.keys(store.accountpools[address]).filter(
      (id) => !currentAccountPools[id],
    );

    store.accountpools[address] = poolIdsToRemove.reduce(
      (poolsById, idToRemove) => {
        if (idToRemove in poolsById) {
          return dissoc(idToRemove, poolsById);
        }
        return poolsById;
      },
      store.accountpools[address],
    );

    Object.keys(currentAccountPools).forEach((poolId) => {
      store.accountpools[address][poolId] = currentAccountPools[poolId];
    });
  }
}
