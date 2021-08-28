import { Services } from "../../services";
import { Store } from "../../store";
import { Pool, AssetAmount, Amount, Network } from "../../entities";
import { isIBCDenom } from "../../services/utils/IbcService";
import { createPoolKey } from "../../utils";
import { AccountPool } from "../../store/pools";

type PickSif = Pick<Services["sif"], "getState">;
type PickClp = Pick<
  Services["clp"],
  "getPoolSymbolsByLiquidityProvider" | "getRawPools" | "getLiquidityProvider"
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
  { sif, clp, chains, tokenRegistry }: SyncPoolsArgs,
  store: SyncPoolsStore,
) {
  return async function syncPools() {
    const state = sif.getState();

    // UPdate pools
    const nativeAsset = chains.get(Network.SIFCHAIN).nativeAsset;
    const rawPools = await clp.getRawPools();
    const registry = await tokenRegistry.load();

    const pools = rawPools.pools
      .map((pool) => {
        const externalSymbol = pool.externalAsset?.symbol;
        const entry = registry.find(
          (item) =>
            item.denom === externalSymbol || item.baseDenom === externalSymbol,
        );
        if (!entry) return null;

        const asset = chains
          .get(Network.SIFCHAIN)
          .findAssetWithLikeSymbol(entry.baseDenom);

        if (!asset) {
          console.log(entry, externalSymbol);
        }
        if (!asset) return null;

        return Pool(
          AssetAmount(nativeAsset, pool.nativeAssetBalance),
          AssetAmount(asset, pool.externalAssetBalance),
          Amount(pool.poolUnits),
        );
      })
      .filter((val) => val != null) as Pool[];

    // const pools = await clp.getPools();
    for (let pool of pools) {
      store.pools[pool.symbol()] = pool;
    }

    // Update lp pools
    if (state.address) {
      const accountPoolSymbols = await clp.getPoolSymbolsByLiquidityProvider(
        state.address,
      );

      // This is a hot method when there are a heap of pools
      // Ideally we would have a better rest endpoint design

      const currentAccountPools: Record<string, AccountPool> = {};
      if (!store.accountpools[state.address]) {
        store.accountpools[state.address] = {};
      }

      await Promise.all(
        accountPoolSymbols.map(async (symbol) => {
          const entry = registry.find(
            (item) => item.denom === symbol || item.baseDenom === symbol,
          );
          if (!entry) return null;

          const asset = chains
            .get(Network.SIFCHAIN)
            .findAssetWithLikeSymbol(entry.baseDenom);

          if (!asset) return;

          const lp = await clp.getLiquidityProvider({
            asset,
            lpAddress: state.address,
          });

          if (!lp || !asset) return;

          const pool = createPoolKey(
            asset,
            chains.get(Network.SIFCHAIN).nativeAsset,
          );

          currentAccountPools[pool] = { lp, pool };
        }),
      );

      Object.keys(store.accountpools[state.address]).forEach((poolId) => {
        // If pool is gone now, delete. Ie user remioved all liquidity
        if (!currentAccountPools[poolId]) {
          delete store.accountpools[state.address][poolId];
        }
      });
      Object.keys(currentAccountPools).forEach((poolId) => {
        store.accountpools[state.address][poolId] = currentAccountPools[poolId];
      });
    }
  };
}
