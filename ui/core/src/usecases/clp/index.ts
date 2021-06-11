import { UsecaseContext } from "..";
import { effect } from "@vue/reactivity";
import { Swap } from "./swap";
import { AddLiquidity } from "./addLIquidity";
import { RemoveLiquidity } from "./removeLiquidity";
import { SyncPools } from "./syncPools";

export default ({
  services,
  store,
}: UsecaseContext<
  "sif" | "clp" | "bus",
  "pools" | "wallet" | "accountpools"
>) => {
  const syncPools = SyncPools(services, store);

  return {
    init() {
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
    },
    swap: Swap(services),
    addLiquidity: AddLiquidity(services, store),
    removeLiquidity: RemoveLiquidity(services),
    syncPools,
  };
};
