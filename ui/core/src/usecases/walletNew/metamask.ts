import { Network, WalletType, IAssetAmount } from "../../entities";
import { UsecaseContext } from "..";
import { WalletActions } from "./types";

export default function MetamaskActions(
  context: UsecaseContext,
): WalletActions {
  const { services, store } = context;

  return {
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
      // Eth service already does this on its own, updating its state..
      return services.eth.getState().balances;
    },

    async disconnect(network: Network) {
      await services.eth.disconnect();
    },
  };
}
