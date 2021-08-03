import { Network } from "@sifchain/sdk";
import { computed } from "@vue/reactivity";
import { useCore } from "./useCore";
import { useSubscription } from "./useSubscrition";
import { rootStore } from "@/store";
import { watch } from "vue";

export function useInitialize() {
  const { usecases, store } = useCore();

  // Initialize usecases / watches
  usecases.clp.initClp();
  usecases.wallet.sif.initSifWallet();
  usecases.wallet.eth.initEthWallet();
  usecases.wallet.cosmoshub.initCosmoshubWallet();

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

  // Bridge from old useCore to new wallet store
  // For now, this wallet store is a facade for core.
  [
    {
      network: Network.ETHEREUM,
      store: store.wallet.eth,
    },
    {
      network: Network.SIFCHAIN,
      store: store.wallet.sif,
    },
  ].forEach((data) => {
    watch(
      () => data.store.isConnected,
      () => {
        rootStore.accounts.setConnected({
          network: data.network,
          connected: data.store.isConnected,
        });
      },
    );
    watch(
      () => data.store.address,
      () => {
        rootStore.accounts.setAddress({
          network: data.network,
          address: data.store.address,
        });
      },
    );
    watch(
      () => data.store.balances,
      () => {
        rootStore.accounts.setBalances({
          network: data.network,
          balances: data.store.balances,
        });
      },
    );
  });

  watch(
    () => store.wallet.sif.address,
    () => rootStore.accounts.loadAccount({ network: Network.COSMOSHUB }),
    { immediate: true },
  );
}
