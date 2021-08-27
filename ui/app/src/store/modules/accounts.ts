import balancesAreDifferent from "@sifchain/sdk/src/usecases/walletNew/utils/balancesAreDifferent";
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
  connecting: boolean;
  log: string;
}
const initWalletState = (network: Network) => ({
  network,
  accounts: [],
  balances: [],
  address: "",
  connected: false,
  connecting: false,
  log: "",
});

const getUsecase = (network: Network) => {
  return core.usecases.walletNew[
    network === Network.ETHEREUM ? "metamask" : "keplr"
  ];
};

const walletBalancePolls = new Map<string, NodeJS.Timeout>();

export const accountStore = Vuextra.createStore({
  name: "accounts",
  options: {
    devtools: true,
  },
  state: Object.values(Network).reduce((acc, network) => {
    acc[network] = initWalletState(network);
    return acc;
  }, {} as Record<Network, IWalletServiceState>),
  getters: (state) => ({
    isConnecting: () => {
      return Object.values(state).some((v) => v.connecting);
    },
    connectedNetworkCount: () => {
      return Object.values(state).filter((v) => v?.connected).length;
    },
    balancesBySymbol: () =>
      Object.fromEntries(
        Object.entries(state).map(([walletName, walletState]) => {
          return [
            walletName,
            walletState.balances.reduce((prev, curr) => {
              prev[curr.symbol] = curr;
              return prev;
            }, {} as Record<string, IAssetAmount>),
          ];
        }),
      ) as Record<string, Record<string, IAssetAmount>>,
  }),
  mutations: (state) => ({
    setConnecting(payload: { network: Network; connecting: boolean }) {
      state[payload.network].connecting = payload.connecting;
    },
    setConnected(payload: { network: Network; connected: boolean }) {
      state[payload.network].connected = payload.connected;
    },
    setAddress(payload: { network: Network; address: string }) {
      state[payload.network].address = payload.address;
    },
    setBalances(payload: { network: Network; balances: IAssetAmount[] }) {
      if (
        balancesAreDifferent(
          self.state[payload.network].balances,
          payload.balances,
        )
      ) {
        state[payload.network].balances = payload.balances;
      }
    },
  }),
  actions: (context) => ({
    async load(network: Network) {
      const usecase = getUsecase(network);
      self.setConnecting({ network, connecting: true });
      try {
        const state = await usecase.load(network);

        self.setConnected({ network, connected: state.connected });
        self.setBalances({ network, balances: state.balances });
        self.setAddress({ network, address: state.address });

        if (!state.connected) return;
        if (walletBalancePolls.has(network)) return;

        (function scheduleUpdate() {
          // NOTE(ajoslin): more formal fix coming later to lazyload non-sif/eth assets.
          const UPDATE_DELAY =
            network === Network.SIFCHAIN || network === Network.ETHEREUM
              ? 4.5 * 1000
              : (15 + Math.random() * 10) * 1000; // Some drift on updates for other chains.

          const timeoutId = setTimeout(async () => {
            await self.updateBalances(network);
            scheduleUpdate();
          }, UPDATE_DELAY);
          walletBalancePolls.set(network, timeoutId);
        })();
      } catch (error) {
        console.error(network, "wallet connect error", error);
      } finally {
        self.setConnecting({ network, connecting: false });
      }
    },

    async updateBalances(network: Network) {
      if (!self.state[network].connected) return;

      const usecase = getUsecase(network);
      const balances = await usecase.getBalances(
        network,
        self.state[network].address,
      );

      self.setBalances({ network, balances });
    },

    async disconnect(network: Network) {
      const usecase = getUsecase(network);

      const timeoutId = walletBalancePolls.get(network);
      if (timeoutId != null) {
        clearTimeout(timeoutId);
      }
      walletBalancePolls.delete(network);

      return usecase.disconnect(network);
    },
  }),
  modules: [],
});

const self = accountStore;

(window as any).accountStore = accountStore;
