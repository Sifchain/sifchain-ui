import { Network, WalletType, IAssetAmount } from "../../entities";
import { UsecaseContext } from "..";
import { WalletActions } from "./types";
import { StargateClient } from "@cosmjs/stargate";

export default function KeplrActions(context: UsecaseContext): WalletActions {
  const { keplrProvider } = context.services.wallet;
  const { chains } = context.services;

  return {
    async load(network: Network) {
      const state = await keplrProvider.connect(chains.get(network));
      return {
        ...state,
        connected: true,
      };
    },

    async getBalances(network: Network, address: string) {
      return keplrProvider.fetchBalances(chains.get(network), address);
    },

    async disconnect(network: Network) {
      return keplrProvider.disconnect(chains.get(network));
    },
  };
}
