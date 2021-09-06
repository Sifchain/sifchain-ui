import { Chain, Network } from "@sifchain/sdk";
import { computed } from "@vue/reactivity";
import { useCore } from "./useCore";
import { useSubscription } from "./useSubscrition";
import { rootStore } from "@/store";
import { watch } from "vue";
import { accountStore } from "@/store/modules/accounts";
import {
  InterchainTx,
  interchainTxEmitter,
} from "@sifchain/sdk/src/usecases/interchain/_InterchainApi";

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
// NOTE(mccallofthewild): Above behavior is now deprecated for keplr wallet, as the getKey method
// now exists. Will auto-query balances.
const persistConnected = {
  get: (network: Network) => {
    return (
      useCore().services.storage.getItem(`walletConnected_${network}`) ===
      "true"
    );
  },
  set: (network: Network) => {
    return useCore().services.storage.setItem(
      `walletConnected_${network}`,
      "true",
    );
  },
};

let connectAll = () => {
  const core = useCore();
  if (core.services.storage.getItem("hasRejectedConnectAll") === "true") {
    return;
  }
  core.services?.wallet.tryConnectAllWallets().catch((e) => {
    core.services.storage.setItem("hasRejectedConnectAll", "true");
  });
};
export function useInitialize() {
  connectAll();
  connectAll = () => {};
  const { usecases, store, services } = useCore();

  // Initialize usecases / watches
  usecases.wallet.eth.initEthWallet();

  // this is low pri... but we want it semi quick
  setTimeout(() => {
    usecases.clp.syncPools.syncPublicPools();
  }, 500);

  // Support legacy code that uses sif service getState().
  watch(
    accountStore.refs.sifchain.computed(),
    () => {
      const storeState = accountStore.state.sifchain;
      const state = services.sif.getState();
      state.balances = storeState.balances;
      state.address = storeState.address;
      state.connected = storeState.connected;
      state.accounts = [storeState.address];
      mirrorToCore(Network.SIFCHAIN);
      if (storeState.connected) {
        persistConnected.set(Network.SIFCHAIN);
      }
    },
    { deep: true },
  );

  // Connect to networks in sequence, starting with Sifchain.
  (async () => {
    for (const network of Object.values(Network)) {
      accountStore.actions.loadIfConnected(network);
      watch(
        accountStore.refs[network].computed(),
        (value) => {
          if (value.connected) {
            persistConnected.set(network);
            mirrorToCore(network);
          }
        },
        {
          deep: true,
        },
      );
      if (
        persistConnected.get(network) &&
        !accountStore.state[network].connected
      ) {
        accountStore.actions.load(network);
      }
    }
  })();

  interchainTxEmitter.on("tx_sent", (tx: InterchainTx) => {
    accountStore.updateBalances(tx.toChain.network);
    accountStore.updateBalances(tx.fromChain.network);
  });
  interchainTxEmitter.on("tx_complete", (tx: InterchainTx) => {
    accountStore.updateBalances(tx.toChain.network);
    accountStore.updateBalances(tx.fromChain.network);
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
