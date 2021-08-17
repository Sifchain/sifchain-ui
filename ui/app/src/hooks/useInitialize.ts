import { Network } from "@sifchain/sdk";
import { computed } from "@vue/reactivity";
import { useCore } from "./useCore";
import { useSubscription } from "./useSubscrition";
import { rootStore } from "@/store";
import { watch } from "vue";
import { accountStore } from "@/store/modules/accounts";

const mirrorToCore = (network: Network) => {
  const data = accountStore.state[network];
  useCore().store.wallet.set(network, {
    isConnected: data.connected,
    balances: data.balances,
    address: data.address,
  });
};

const persistConnected = {
  get: (network: Network) => {
    return localStorage.getItem(`walletConnected_${network}`) === "true";
  },
  set: (network: Network, value: Boolean) => {
    return localStorage.setItem(`walletConnected_${network}`, String(!!value));
  },
};

export function useInitialize() {
  const { usecases, store } = useCore();

  // Initialize usecases / watches
  usecases.clp.initClp();
  usecases.wallet.eth.initEthWallet();

  // initialize subscriptions
  useSubscription(
    computed(() => store.wallet.get(Network.ETHEREUM).address), // Needs a ref
    usecases.peg.subscribeToUnconfirmedPegTxs,
  );

  Object.values(Network).forEach((network) => {
    watch(
      accountStore.refs[network].computed(),
      (value) => {
        persistConnected.set(network, value.connected);
        mirrorToCore(network);
      },
      {
        deep: true,
      },
    );

    if (persistConnected.get(network)) {
      accountStore.actions.load(network);
    }
  });

  // useSubscription(
  //   computed(() => store.wallet.get(Network.SIFCHAIN).address),
  //   () => usecases.reward.subscribeToRewardData("vs"),
  // );
  // useSubscription(
  //   computed(() => store.wallet.get(Network.SIFCHAIN).address),
  //   () => usecases.reward.subscribeToRewardData("lm"),
  // );

  // useSubscription(
  //   computed(() => store.wallet.get(Network.SIFCHAIN).lmUserData),
  //   usecases.reward.notifyLmMaturity,
  // );
  // useSubscription(
  //   computed(() => store.wallet.get(Network.SIFCHAIN).vsUserData),
  //   usecases.reward.notifyVsMaturity,
  // );
}
