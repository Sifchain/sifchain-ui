import { Network, WalletType, IAssetAmount } from "../../entities";
import { UsecaseContext } from "..";
import diffBalances from "./utils/diffBalances";
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

    async getBalances(
      network: Network,
      current: { address: string; balances: IAssetAmount[] },
    ) {
      // Eth service already does this on its own, updating its state..
      const state = services.eth.getState();

      return {
        balances: state.balances,
        changed: diffBalances(state.balances, current.balances),
      };
    },

    async disconnect(network: Network) {
      await services.eth.disconnect();
    },
  };
}
