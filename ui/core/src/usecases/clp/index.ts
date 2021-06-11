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
  const usecases = {
    init() {
      // Sync on load
      usecases.syncPools().then(() => {
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
        await usecases.syncPools();
      });

      effect(() => {
        // When sif address changes syncPools
        store.wallet.sif.address;
        usecases.syncPools();
      });
    },
    swap: Swap(services),
    addLiquidity: AddLiquidity(services, store),
    removeLiquidity: RemoveLiquidity(services),
    syncPools: SyncPools(services, store),
  };

  return usecases;
};
