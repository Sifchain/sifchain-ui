import { Services } from "../../services";
import { Store } from "../../store";
import { toPool } from "../../services/utils/SifClient/toPool";
import { isIBCDenom } from "../../services/utils/IbcService";
import { RawPool } from "../../services/utils/SifClient/x/clp";
import { Network, Asset, Pool, AssetAmount, Amount } from "../../entities";

type PickSif = Pick<Services["sif"], "getState">;
type PickClp = Pick<
  Services["clp"],
  "getPoolSymbolsByLiquidityProvider" | "getRawPools" | "getLiquidityProvider"
>;
type PickIbc = Pick<Services["ibc"], "symbolLookup">;
type SyncPoolsArgs = {
  sif: PickSif;
  clp: PickClp;
  ibc: PickIbc;
};

type SyncPoolsStore = Pick<Store, "accountpools" | "pools">;

export function SyncPools(
  { sif, clp, ibc }: SyncPoolsArgs,
  store: SyncPoolsStore,
) {
  return async function syncPools() {
    const state = sif.getState();

    // Update pools
    const rawPools = await clp.getRawPools();

    const pools = rawPools
      .map((rawPool) => {
        let externalSymbol = rawPool.external_asset.symbol;
        if (isIBCDenom(externalSymbol)) {
          externalSymbol = ibc.symbolLookup[externalSymbol];
        }

        let externalAsset;
        try {
          externalAsset = Asset.get(externalSymbol);
        } catch (error) {
          return null;
        }

        return Pool(
          // TODO(ajoslin): figure out how to get access to rowan nativeAsset here...
          AssetAmount(Asset.get("rowan"), rawPool.native_asset_balance),
          AssetAmount(externalAsset, rawPool.external_asset_balance),
          Amount(rawPool.pool_units),
        );
      })
      .filter((pool) => pool != null) as Pool[];

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

      accountPoolSymbols.forEach(async (symbol) => {
        const lp = await clp.getLiquidityProvider({
          symbol,
          lpAddress: state.address,
        });
        if (!lp) return;
        const pool = `${symbol}_rowan`;
        store.accountpools[state.address] =
          store.accountpools[state.address] || {};

        store.accountpools[state.address][pool] = { lp, pool };
      });

      // Delete accountpools
      const currentPoolIds = accountPoolSymbols.map((id) => `${id}_rowan`);
      if (store.accountpools[state.address]) {
        const existingPoolIds = Object.keys(store.accountpools[state.address]);
        const disjunctiveIds = existingPoolIds.filter(
          (id) => !currentPoolIds.includes(id),
        );

        disjunctiveIds.forEach((poolToRemove) => {
          delete store.accountpools[state.address][poolToRemove];
        });
      }
    }
  };
}
