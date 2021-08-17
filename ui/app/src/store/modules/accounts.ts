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
const initWalletState = (network: Network) => ({
  network,
  accounts: [],
  balances: [],
  address: "",
  connected: false,
  log: "",
});

const getUsecase = (network: Network) => {
  return core.usecases.walletNew[
    network === Network.ETHEREUM ? "metamask" : "keplr"
  ];
};
export const accountStore = Vuextra.createStore({
  name: "accounts",
  options: {
    devtools: true,
  },
  state: {
    ethereum: initWalletState(Network.ETHEREUM),
    sifchain: initWalletState(Network.SIFCHAIN),
    cosmoshub: initWalletState(Network.COSMOSHUB),
    iris: initWalletState(Network.IRIS),
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
    async load(network: Network) {
      const usecase = getUsecase(network);
      try {
        const state = await usecase.load(network);

        console.log(network, state);

        accountStore.setConnected({ network, connected: state.connected });
        accountStore.setBalances({ network, balances: state.balances });
        accountStore.setAddress({ network, address: state.address });

        if (!state.connected) return;

        setInterval(async () => {
          const { balances, changed } = await usecase.getBalances(network, {
            balances: state.balances,
            address: state.address,
          });
          if (changed) {
            accountStore.setBalances({ network, balances });
          }
        }, 10 * 1000);
      } catch (error) {
        console.error(network, "wallet connect error", error);
      }
    },

    async disconnect(network: Network) {
      const usecase = getUsecase(network);
      return usecase.disconnect(network);
    },
  }),
  modules: [],
});
