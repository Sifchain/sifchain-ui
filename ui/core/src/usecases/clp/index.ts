import { IAsset } from "../../entities";
import { UsecaseContext } from "..";
import { effect } from "@vue/reactivity";
import { Swap } from "./swap";
import { AddLiquidity } from "./addLIquidity";
import { RemoveLiquidity } from "./removeLiquidity";

export default ({
  services,
  store,
}: UsecaseContext<
  "sif" | "clp" | "bus",
  "pools" | "wallet" | "accountpools"
>) => {
  async function syncPools() {
    const state = services.sif.getState();

    // UPdate pools
    const pools = await services.clp.getPools();
    for (let pool of pools) {
      store.pools[pool.symbol()] = pool;
    }

    // Update lp pools
    if (state.address) {
      const accountPoolSymbols = await services.clp.getPoolSymbolsByLiquidityProvider(
        state.address,
      );

      // This is a hot method when there are a heap of pools
      // Ideally we would have a better rest endpoint design

      accountPoolSymbols.forEach(async (symbol) => {
        const lp = await services.clp.getLiquidityProvider({
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
  }

  // Sync on load
  syncPools().then(() => {
    effect(() => {
      if (Object.keys(store.pools).length === 0) {
        services.bus.dispatch({
          type: "NoLiquidityPoolsFoundEvent",
          payload: {},
        });
      }
    });
  });

  // Then every transaction

  services.sif.onNewBlock(async () => {
    await syncPools();
  });

  effect(() => {
    // When sif address changes syncPools
    store.wallet.sif.address;
    syncPools();
  });

  const actions = {
    swap: Swap(services),
    addLiquidity: AddLiquidity(services, store),
    removeLiquidity: RemoveLiquidity(services),
  };

  return actions;
};
