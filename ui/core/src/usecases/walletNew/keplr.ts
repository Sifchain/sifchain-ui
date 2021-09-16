import { Network, WalletType, IAssetAmount } from "../../entities";
import { UsecaseContext } from "..";
import { WalletActions } from "./types";
import { StargateClient } from "@cosmjs/stargate";

export default function KeplrActions(context: UsecaseContext): WalletActions {
  const { keplrProvider } = context.services.wallet;
  const { chains } = context.services;

  return {
    async loadIfConnected(network: Network) {
      const chain = chains.get(network);
      const hasConnected = await keplrProvider.hasConnected(chain);
      if (hasConnected) {
        const state = await keplrProvider.connect(chain);
        return {
          ...state,
          connected: true,
        };
      }
      return {
        connected: false,
      };
    },
    async load(network: Network) {
      const state = await keplrProvider.connect(chains.get(network));
      if (network === Network.SIFCHAIN) {
        // For legacy code to work
        context.services.sif.connect();
      }
      return {
        ...state,
        connected: true,
      };
    },

    async getBalances(network: Network, address: string) {
      try {
        return keplrProvider.fetchBalances(chains.get(network), address);
      } catch (error) {
        // Give it ONE retry, sometimes the chain rpc apis fail once...
        return keplrProvider.fetchBalances(chains.get(network), address);
      }
    },

    async disconnect(network: Network) {
      return keplrProvider.disconnect(chains.get(network));
    },
  };
}
