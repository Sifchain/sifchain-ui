import { computed } from "@vue/reactivity";
import { useCore } from "./useCore";
import { useSubscription } from "./useSubscrition";

export function useInitialize() {
  const { usecases, store } = useCore();
  // initialize subscriptions
  useSubscription(
    computed(() => store.wallet.eth.address), // Needs a ref
    usecases.peg.subscribeToUnconfirmedPegTxs,
  );

  useSubscription(
    computed(() => store.wallet.sif.address),
    usecases.wallet.sif.getUserLmData,
  );
  useSubscription(
    computed(() => store.wallet.sif.address),
    usecases.wallet.sif.getUserVsData,
  );
  useSubscription(
    computed(() => store.wallet.sif.lmUserData),
    usecases.wallet.sif.notifyLmMaturity,
  );
  useSubscription(
    computed(() => store.wallet.sif.vsUserData),
    usecases.wallet.sif.notifyVsMaturity,
  );
}
