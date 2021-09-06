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
      // await new Promise<void>((resolve, reject) => {
      //   const validChainId = services.chains.get(Network.ETHEREUM).chainConfig
      //     .chainId;

      //   services.eth.onChainIdDetected(async (chainId) => {
      //     if (chainId !== validChainId) {
      //       services.bus.dispatch({
      //         type: "WalletConnectionErrorEvent",
      //         payload: {
      //           walletType: "eth",
      //           message: `Metamask failed to connect. Please select ${chainIdName.get(
      //             validChainId,
      //           )}.`,
      //         },
      //       });
      //       reject();
      //     } else {
      //       resolve();
      //     }
      //   });
      // });
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
