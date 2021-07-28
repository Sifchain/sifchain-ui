import { computed } from "@vue/reactivity";
import { useCore } from "./useCore";
import { useSubscription } from "./useSubscrition";

export function useInitialize() {
  const { usecases, store } = useCore();

  // Initialize usecases / watches
  usecases.clp.initClp();
  console.log("initClp");
  usecases.wallet.sif.initSifWallet();
  usecases.wallet.eth.initEthWallet();
  usecases.wallet.cosmoshub.initcosmoshubWallet();

  // initialize subscriptions
  useSubscription(
    computed(() => store.wallet.eth.address), // Needs a ref
    usecases.peg.subscribeToUnconfirmedPegTxs,
  );

  useSubscription(
    computed(() => store.wallet.sif.address),
    () => usecases.reward.subscribeToRewardData("vs"),
  );
  useSubscription(
    computed(() => store.wallet.sif.address),
    () => usecases.reward.subscribeToRewardData("lm"),
  );

  useSubscription(
    computed(() => store.wallet.sif.lmUserData),
    usecases.reward.notifyLmMaturity,
  );
  useSubscription(
    computed(() => store.wallet.sif.vsUserData),
    usecases.reward.notifyVsMaturity,
  );
}
