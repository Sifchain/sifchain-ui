import { rootStore } from "..";
import { IAssetAmount, Network } from "../../../../core/src";
import { useCore } from "../../hooks/useCore";
import { Actions } from "../actions";
import { Vuextra } from "../Vuextra";
const core = useCore();
export interface IWalletServiceState {
  network: Network;
  address: string;
  accounts: string[];
  connected: boolean;
  balances: IAssetAmount[];
  log: string;
}

export const accountStore = Vuextra.createStore({
  options: {
    devtools: true,
  },
  state: {
    sifchain: {
      network: Network.SIFCHAIN,
      accounts: [],
      address: "",
      connected: false,
      balances: [],
      log: "",
    },
    ethereum: {
      network: Network.ETHEREUM,
      accounts: [],
      address: "",
      connected: false,
      balances: [],
      log: "",
    },
    cosmoshub: {
      network: Network.COSMOSHUB,
      accounts: [],
      address: "",
      connected: false,
      balances: [],
      log: "",
    },
  } as Record<Network, IWalletServiceState>,
  getters: (state) => ({
    connectedNetworkCount: () => {
      return Object.values(state).filter((v) => v?.connected).length;
    },
  }),
  mutations: (state) => ({
    setConnected(payload: { network: Network; isConnected: boolean }) {
      state[payload.network].connected = payload.isConnected;
    },
    setAddress(payload: { network: Network; address: string }) {
      state[payload.network].address = payload.address;
    },
    setBalances(payload: { network: Network; balances: IAssetAmount[] }) {
      state[payload.network].balances = payload.balances;
    },
  }),
  actions: (context) => ({
    loadAccount(p: { network: Network }) {
      core.services.ibc.createWalletByNetwork(Network.COSMOSHUB).then((w) => {
        accountStore.setAddress({
          network: p.network,
          address: w.addresses[0],
        });
        accountStore.setBalances({
          network: p.network,
          balances: w.balances,
        });
      });
    },
    connect(network: Network) {
      context.state.ethereum.connected = false;
      accountStore.mutations.setConnected({ network, isConnected: true });
    },
  }),
  modules: [],
});
accountStore.loadAccount({ network: Network.COSMOSHUB });

accountStore.connect(Network.SIFCHAIN);
accountStore.mutations.setConnected({
  network: Network.SIFCHAIN,
  isConnected: true,
});

// setInterval(() => {
//   walletStore.setConnected({
//     network: Network.ETHEREUM,
//     isConnected: !walletStore.state?.ethereum.connected,
//   });
// }, 1000);
