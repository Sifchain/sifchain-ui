import { UsecaseContext } from "..";
import { effect, ReactiveEffect, stop } from "@vue/reactivity";
import { Swap } from "./swap";
import { AddLiquidity } from "./addLiquidity";
import { RemoveLiquidity } from "./removeLiquidity";
import { SyncPools } from "./syncPools";

export default ({
  services,
  store,
}: UsecaseContext<
  "sif" | "clp" | "bus" | "ibc" | "chains",
  "pools" | "wallet" | "accountpools"
>) => {
  const syncPools = SyncPools(services, store);

  return {
    initClp() {
      const effects: ReactiveEffect<any>[] = [];

      // Sync on load
      syncPools().then(() => {
        effects.push(
          effect(() => {
            if (Object.keys(store.pools).length === 0) {
              services.bus.dispatch({
                type: "NoLiquidityPoolsFoundEvent",
                payload: {},
              });
            }
          }),
        );
      });

      // Then every transaction

      const unsubscribe = services.sif.onNewBlock(async () => {
        await syncPools();
      });

      effects.push(
        effect(() => {
          // When sif address changes syncPools
          store.wallet.sif.address;
          syncPools();
        }),
      );

      return () => {
        for (let ef of effects) {
          stop(ef);
        }
        unsubscribe();
      };
    },
    swap: Swap(services),
    addLiquidity: AddLiquidity(services, store),
    removeLiquidity: RemoveLiquidity(services),
    syncPools,
  };
};
