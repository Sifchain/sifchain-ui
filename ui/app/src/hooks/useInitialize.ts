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
    ...useCore().store.wallet.get(network),
    isConnected: data.connected,
    balances: data.balances,
    address: data.address,
  });
};

// NOTE(ajoslin): we only want to auto-connect to a wallet/chain if the user has
// connected before. First time user connects, we persist it to localStorage.
// If and only if that value is in localStorage on load, auto try to connect the wallet on load.
// This prevents many Keplr connect popups from showing on load for each network.
const persistConnected = {
  get: (network: Network) => {
    return (
      useCore().services.storage.getItem(`walletConnected_${network}`) ===
      "true"
    );
  },
  set: (network: Network, value: Boolean) => {
    return useCore().services.storage.setItem(
      `walletConnected_${network}`,
      String(!!value),
    );
  },
};

export function useInitialize() {
  const { usecases, store } = useCore();

  // Initialize usecases / watches
  usecases.clp.initClp();
  usecases.wallet.eth.initEthWallet();

  // initialize subscriptions
  // watch(accountStore.refs.ethereum.address.computed(), (value) => {
  //   if (value) {
  //     usecases.peg.subscribeToUnconfirmedPegTxs();
  //   }
  // });

  // Connect to networks in sequence, starting with Sifchain.
  Object.values(Network)
    .sort((n) => (n === Network.SIFCHAIN ? -1 : 1))
    .reduce((promise, network) => {
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
      return promise.then(async () => {
        if (
          persistConnected.get(network) &&
          !accountStore.state[network].connected
        ) {
          await accountStore.actions.load(network);
        }
      });
    }, Promise.resolve());

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
