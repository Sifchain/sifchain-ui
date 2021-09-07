import { UsecaseContext } from "..";
import { effect, ReactiveEffect, stop } from "@vue/reactivity";
import { Swap } from "./swap";
import { AddLiquidity } from "./addLiquidity";
import { RemoveLiquidity } from "./removeLiquidity";
import { SyncPools } from "./syncPools";
import { Network } from "../../entities";

const PUBLIC_POOLS_POLL_DELAY = 60 * 1000;
const USER_POOLS_POLL_DELAY = 300 * 1000;

export default ({
  services,
  store,
}: UsecaseContext<
  "sif" | "clp" | "bus" | "ibc" | "chains" | "tokenRegistry",
  "pools" | "wallet" | "accountpools"
>) => {
  const syncPools = SyncPools(services, store);

  return {
    swap: Swap(services),
    addLiquidity: AddLiquidity(services, store),
    removeLiquidity: RemoveLiquidity(services),
    syncPools,
    subscribeToPublicPools: () => {
      let timeoutId: NodeJS.Timeout;

      async function publicPoolsLoop() {
        try {
          await syncPools.syncPublicPools();
        } catch (error) {
          console.log("Sync pools error", error);
        } finally {
          timeoutId = setTimeout(publicPoolsLoop, PUBLIC_POOLS_POLL_DELAY);
        }
      }
      return {
        unsubscribe: () => clearTimeout(timeoutId),
        initPromise: publicPoolsLoop(),
      };
    },
    subscribeToUserPools: (address: string) => {
      let timeoutId: NodeJS.Timeout;

      async function userPoolsLoop() {
        try {
          await syncPools.syncUserPools(address);
        } catch (error) {
          console.log("Sync pools error", error);
        } finally {
          timeoutId = setTimeout(userPoolsLoop, USER_POOLS_POLL_DELAY);
        }
      }
      return {
        unsubscribe: () => clearTimeout(timeoutId),
        initPromise: userPoolsLoop(),
      };
    },
  };
};
