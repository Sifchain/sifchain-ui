import { Network, WalletType, IAssetAmount } from "../../entities";
import { UsecaseContext } from "..";
import { WalletActions } from "./types";

// const chainIdName = new Map([
//   ["0x1", "Ethereum Mainnet"],
//   ["0x3", "Ropsten Test Network"],
// ]);

export default function MetamaskActions(
  context: UsecaseContext,
): WalletActions {
  const { services, store } = context;

  return {
    async loadIfConnected(network: Network) {
      await new Promise((r) => setTimeout(r, 500));
      if (services.eth.isConnected()) {
        return this.load(network);
      }
      return {
        connected: false,
      };
    },
    async load(network: Network) {
      await services.eth.connect();

      const state = services.eth.getState();
      return {
        connected: state.connected,
        address: state.address,
        balances: state.balances,
      };
    },

    async getBalances(network: Network, address: string) {
      if (!services.eth.isConnected) return [];
      // Eth service already does this on its own, updating its state..
      const balances = await services.eth.getBalance();
      services.eth.getState().balances = balances;
      return balances;
    },

    async disconnect(network: Network) {
      await services.eth.disconnect();
    },
  };
}
