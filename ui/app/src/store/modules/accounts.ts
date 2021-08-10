import { IAssetAmount, Network } from "../../../../core/src";
import { useCore } from "../../hooks/useCore";
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
  name: "accounts",
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
    setConnected(payload: { network: Network; connected: boolean }) {
      state[payload.network].connected = payload.connected;
    },
    setAddress(payload: { network: Network; address: string }) {
      state[payload.network].address = payload.address;
    },
    setBalances(payload: { network: Network; balances: IAssetAmount[] }) {
      state[payload.network].balances = payload.balances;
    },
  }),
  actions: (context) => ({
    loadIBCAccount(p: { network: Network }) {
      return core.services.ibc.createWalletByNetwork(p.network).then((w) => {
        accountStore.setConnected({ network: p.network, connected: true });
        accountStore.setAddress({
          network: p.network,
          address: w.addresses[0],
        });
        accountStore.setBalances({
          network: p.network,
          balances: w.balances,
        });

        const intervalId: NodeJS.Timeout = setInterval(async () => {
          if (
            !accountStore.state.cosmoshub.connected ||
            accountStore.state.cosmoshub.address !== w.addresses[0]
          ) {
            return clearInterval(intervalId);
          }
          const balances = await core.services.ibc.getAllBalances({
            network: p.network,
            client: w.client,
            address: w.addresses[0],
          });
          accountStore.setBalances({
            network: p.network,
            balances,
          });
          core.store.wallet.cosmoshub.balances = balances;
        }, 15_000);
      });
    },
    connect(network: Network) {
      accountStore.mutations.setConnected({ network, connected: true });
    },
  }),
  modules: [],
});
