import { IAsset, IAssetAmount, Network } from "@sifchain/sdk";

import { useChains } from "~/hooks/useChains";
import { useCore } from "~/hooks/useCore";
import { Vuextra } from "~/store/Vuextra";

const serializeAsKey = (balances: IAssetAmount[]) =>
  balances
    .map(({ amount, symbol }) => `${symbol}_${amount.toBigInt().toString()}`)
    .join("|");

function balancesAreDifferent(b1: IAssetAmount[], b2: IAssetAmount[]) {
  // Extremely naive check just so we don't spam state-setting with the exact same balance list.
  // Yes, if balances change order or are added/removed it will re-set the whole array. Don't care.
  return serializeAsKey(b1) !== serializeAsKey(b2);
}

export interface IWalletServiceState {
  network: Network;
  address: string;
  accounts: string[];
  connected: boolean;
  hasLoadedBalancesOnce: boolean;
  balances: IAssetAmount[];
  connecting: boolean;
  log: string;
}
const initWalletState = (network: Network) => ({
  network,
  accounts: [],
  balances: [],
  hasLoadedBalancesOnce: false,
  address: "",
  connected: false,
  connecting: false,
  log: "",
});

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
      if (!state[payload.network].hasLoadedBalancesOnce) {
        state[payload.network].hasLoadedBalancesOnce = true;
      }
    },
  }),
  actions: (context) => ({
    async loadIfConnected(network: Network) {
      const chain = useChains().get(network);
      const provider = useCore().services.wallet.getPreferredProvider(chain);
      if (await provider.hasConnected(chain)) {
        this.load(network);
      }
    },
    async load(network: Network) {
      const chain = useChains().get(network);
      const provider = useCore().services.wallet.getPreferredProvider(chain);

      self.setConnecting({ network, connecting: true });
      try {
        const address = await provider.connect(chain);
        self.setConnected({ network, connected: true });

        if (typeof address === "string") {
          self.setAddress({ network, address });
        }
      } catch (error) {
        console.error(network, "wallet connect error", error);
      } finally {
        self.setConnecting({ network, connecting: false });
      }
    },

    async pollBalances(network: Network) {
      let timeoutId: NodeJS.Timeout;
      if (self.state[network].connected) {
        const UPDATE_DELAY = 4.5 * 1000;

        (async function scheduleUpdate() {
          timeoutId = setTimeout(run, UPDATE_DELAY);
          walletBalancePolls.set(network, timeoutId);

          async function run() {
            await self.updateBalances(network);
            scheduleUpdate();
          }
        })();
      }
      return () => clearTimeout(timeoutId);
    },

    async updateBalances(network: Network) {
      if (!self.state[network].connected) return;

      const chain = useChains().get(network);
      const provider = useCore().services.wallet.getPreferredProvider(chain);

      const balances = await provider.fetchBalances(
        chain,
        self.state[chain.network].address,
      );
      self.setBalances({ network, balances });
    },

    async updateBalance(params: { network: Network; asset: IAsset }) {
      const { network, asset } = params;
      if (!self.state[network].connected) return;

      const chain = useChains().get(network);
      const provider = useCore().services.wallet.getPreferredProvider(chain);

      const balance = await provider.fetchBalance(
        chain,
        self.state[chain.network].address,
        asset.symbol,
      );
      const replacedBalances = self.state[network].balances.map((b) =>
        b.symbol === balance.symbol ? balance : b,
      );

      self.setBalances({
        network,
        balances: replacedBalances.length ? replacedBalances : [balance],
      });
    },

    async disconnect(network: Network) {
      // const usecase = getUsecase(network);
      // const timeoutId = walletBalancePolls.get(network);
      // if (timeoutId != null) {
      //   clearTimeout(timeoutId);
      // }
      // walletBalancePolls.delete(network);
      // return usecase.disconnect(network);
    },
  }),
  modules: [],
});

const self = accountStore;

(window as any).accountStore = accountStore;
