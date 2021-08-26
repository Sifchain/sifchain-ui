import { UsecaseContext } from "..";
import { effect, ReactiveEffect, stop } from "@vue/reactivity";
import { Swap } from "./swap";
import { AddLiquidity } from "./addLiquidity";
import { RemoveLiquidity } from "./removeLiquidity";
import { SyncPools } from "./syncPools";
import { Network } from "../../entities";

export default ({
  services,
  store,
}: UsecaseContext<
  "sif" | "clp" | "bus" | "ibc" | "chains" | "tokenRegistry",
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
      let syncTimeoutId: NodeJS.Timeout;
      const unsubscribe = () => clearTimeout(syncTimeoutId);
      (async function poolsLoop() {
        await syncPools();
        syncTimeoutId = setTimeout(poolsLoop, 15 * 1000);
      })();

      effects.push(
        effect(() => {
          // When sif address changes syncPools
          store.wallet.get(Network.SIFCHAIN).address;
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
