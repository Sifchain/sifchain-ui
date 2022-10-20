import { watch } from "vue";
import { Network } from "@sifchain/sdk";
import {
  BridgeTx,
  bridgeTxEmitter,
} from "@sifchain/sdk/src/clients/bridges/BaseBridge";

import { accountStore } from "~/store/modules/accounts";
import { isChainFlaggedDisabled } from "~/store/modules/flags";

import { useCore } from "./useCore";
import { useChains } from "./useChains";
import { useFaucet } from "./useFaucet";

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
  core.services?.wallet.tryConnectAllWallets().catch(() => {
    core.services.storage.setItem("hasRejectedConnectAll", "true");
  });
};
export function useInitialize() {
  connectAll();
  connectAll = () => {};

  useFaucet();

  const { usecases, services } = useCore();

  services.wallet.metamaskProvider.onChainChanged(() =>
    window.location.reload(),
  );
  services.wallet.metamaskProvider.onAccountChanged(() =>
    window.location.reload(),
  );
  services.wallet.keplrProvider.onAccountChanged(() =>
    window.location.reload(),
  );

  // this is low pri... but we want it semi quick
  setTimeout(() => {
    usecases.clp.syncPools.syncPublicPools();
  }, 500);

  services.ethbridge
    .addEthereumAddressToPeggyCompatibleCosmosAssets(
      services.wallet.metamaskProvider,
    )
    .then(() => {
      // generateUniswapWhitelist();
    });

  // Support legacy code that uses sif service getState().
  watch(
    accountStore.state.sifchain,
    (storeState) => {
      const state = services.sif.getState();

      if (storeState.connected && !state.connected) {
        accountStore.updateBalances(Network.SIFCHAIN);
        accountStore.pollBalances(Network.SIFCHAIN);

        // For legacy code to work
        services.sif.connect();
        usecases.interchain.txManager.loadSavedTransferList(storeState.address);
      }

      state.balances = storeState.balances;
      state.address = storeState.address;
      state.connected = storeState.connected;
      state.accounts = [storeState.address];
    },
    { deep: true },
  );

  for (const network of Object.values(Network)) {
    if (isChainFlaggedDisabled(useChains().get(network))) {
      continue;
    }

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

  bridgeTxEmitter.on("tx_sent", (tx: BridgeTx) => {
    accountStore.updateBalances(tx.toChain.network);
    accountStore.updateBalances(tx.fromChain.network);
  });
  bridgeTxEmitter.on("tx_complete", (tx: BridgeTx) => {
    accountStore.updateBalances(tx.toChain.network);
    accountStore.updateBalances(tx.fromChain.network);
  });
}
