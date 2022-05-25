import {
  Pool,
  AssetAmount,
  Amount,
  Network,
  LiquidityProvider,
} from "@sifchain/sdk";

import { Services } from "@/business/services";
import { Store } from "@/business/store";
import { createPoolKey } from "@sifchain/sdk/src/utils";
import { AccountPool } from "@/business/store/pools";
import { flagsStore } from "@/store/modules/flags";

type PickSif = Pick<Services["sif"], "getState">;
type PickClp = Pick<
  Services["clp"],
  "getAccountLiquidityProviderData" | "getRawPools"
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

    const rawPools = await clp.getRawPools();

    if (process.env.NODE_ENV === "development") {
      console.log({ rawPools });
    }

    const isPMTPEnabled = flagsStore.state.pmtp;

    const pools = rawPools.pools
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

        return new Pool(
          AssetAmount(nativeAsset, pool.nativeAssetBalance),
          AssetAmount(asset, pool.externalAssetBalance),
          Amount(pool.poolUnits),
          isPMTPEnabled
            ? {
                native: Amount(pool.swapPriceNative).divide(1e18),
                external: Amount(pool.swapPriceExternal).divide(1e18),
              }
            : undefined,
        );
      })
      .filter(Boolean) as Pool[];

    for (const pool of pools) {
      store.pools[pool.symbol()] = pool;
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
      if (!symbol) return;

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

      const lp = new LiquidityProvider(
        asset,
        Amount(lpItem.liquidityProvider.liquidityProviderUnits),
        address,
        Amount(lpItem.nativeAssetBalance),
        Amount(lpItem.externalAssetBalance),
      );
      const pool = createPoolKey(
        asset,
        chains.get(Network.SIFCHAIN).nativeAsset,
      );
      currentAccountPools[pool] = { lp, pool };
    });

    Object.keys(store.accountpools[address]).forEach((poolId) => {
      // If pool is gone now, delete. Ie user removed all liquidity
      if (!currentAccountPools[poolId]) {
        delete store.accountpools[address][poolId];
      }
    });

    Object.keys(currentAccountPools).forEach((poolId) => {
      store.accountpools[address][poolId] = currentAccountPools[poolId];
    });
  }
}
