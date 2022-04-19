import { UsecaseContext } from "../index";
import { AddLiquidity } from "./addLiquidity";
import { RemoveLiquidity } from "./removeLiquidity";
import { SyncPools } from "./syncPools";

const PUBLIC_POOLS_POLL_DELAY = 60 * 1000;
const USER_POOLS_POLL_DELAY = 300 * 1000;

export default ({
  services,
  store,
}: UsecaseContext<
  "sif" | "clp" | "bus" | "ibc" | "chains" | "tokenRegistry" | "wallet",
  "pools" | "wallet" | "accountpools"
>) => {
  const syncPools = SyncPools(services, store);

  return {
    syncPools,
    addLiquidity: AddLiquidity(services, store),
    removeLiquidity: RemoveLiquidity(services),
    subscribeToPublicPools(delay: number = PUBLIC_POOLS_POLL_DELAY) {
      let timeoutId: number;

      async function publicPoolsLoop() {
        timeoutId = window.setTimeout(run, delay);
        async function run() {
          try {
            await syncPools.syncPublicPools();
          } catch (error) {
            console.log("Sync pools error", error);
          } finally {
            publicPoolsLoop();
          }
        }
      }

      publicPoolsLoop();

      return () => window.clearTimeout(timeoutId);
    },
    subscribeToUserPools(
      address: string,
      delay: number = USER_POOLS_POLL_DELAY,
    ) {
      let timeoutId: number;

      async function userPoolsLoop() {
        timeoutId = window.setTimeout(run, delay);
        async function run() {
          try {
            await syncPools.syncUserPools(address);
          } catch (error) {
            console.log("Sync pools error", error);
          } finally {
            userPoolsLoop();
          }
        }
      }

      userPoolsLoop();

      return () => window.clearTimeout(timeoutId);
    },
  };
};
