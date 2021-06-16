import { Services } from "../../services";
import { Store } from "../../store";

type PickSif = Pick<Services["sif"], "getState">;
type PickClp = Pick<
  Services["clp"],
  "getPoolSymbolsByLiquidityProvider" | "getPools" | "getLiquidityProvider"
>;
type SyncPoolsArgs = {
  sif: PickSif;
  clp: PickClp;
};

type SyncPoolsStore = Pick<Store, "accountpools" | "pools">;

export function SyncPools({ sif, clp }: SyncPoolsArgs, store: SyncPoolsStore) {
  return async function syncPools() {
    const state = sif.getState();

    // UPdate pools
    const pools = await clp.getPools();
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
