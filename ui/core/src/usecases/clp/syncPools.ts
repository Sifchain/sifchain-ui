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
type SyncPoolsArgs = {
  sif: PickSif;
  clp: PickClp;
  chains: PickChains;
};

type SyncPoolsStore = Pick<Store, "accountpools" | "pools">;

export function SyncPools(
  { sif, clp, chains }: SyncPoolsArgs,
  store: SyncPoolsStore,
) {
  return async function syncPools() {
    const state = sif.getState();

    // UPdate pools
    const nativeAsset = chains.get(Network.SIFCHAIN).nativeAsset;
    const rawPools = await clp.getRawPools();
    const pools = rawPools
      .map((pool) => {
        const externalSymbol = pool.external_asset.symbol;
        const chainAsset = chains.findChainAssetMatch(
          isIBCDenom(externalSymbol)
            ? { ibcDenom: externalSymbol }
            : { symbol: externalSymbol },
        );

        if (!chainAsset) return null;

        return Pool(
          AssetAmount(nativeAsset, pool.native_asset_balance),
          AssetAmount(chainAsset.asset, pool.external_asset_balance),
          Amount(pool.pool_units),
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
          const chainAsset = chains.findChainAssetMatch(
            isIBCDenom(symbol) ? { ibcDenom: symbol } : { symbol: symbol },
          );
          if (!chainAsset) return;
          const asset = chainAsset.asset;

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
