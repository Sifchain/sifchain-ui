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
  "pools" | "wallet" | "accountpools" | "poolsLoadState"
>) => {
  const syncPools = SyncPools(services, store);

  return {
    initClp() {
      const effects: ReactiveEffect<any>[] = [];

      // Then every transaction
      let syncTimeoutId: NodeJS.Timeout;
      const unsubscribe = () => clearTimeout(syncTimeoutId);
      async function poolsLoop() {
        try {
          await syncPools();
        } catch (error) {
          console.log("Sync pools error", error);
        } finally {
          syncTimeoutId = setTimeout(poolsLoop, 15 * 1000);
        }
      }

      effects.push(
        effect(() => {
          // When sif address changes syncPools
          const address = store.wallet.get(Network.SIFCHAIN).address;
          if (address) poolsLoop();
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
