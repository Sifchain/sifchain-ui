import { Network, WalletType, IAssetAmount } from "../../entities";
import { UsecaseContext } from "..";
import { WalletActions } from "./types";
import { StargateClient } from "@cosmjs/stargate";

// TODO(ajoslin): handle account switches gracefully
try {
  window?.addEventListener("keplr_keystorechange", () =>
    window.location.reload(),
  );
} catch (e) {}

export default function KeplrActions(context: UsecaseContext): WalletActions {
  let clients = new Map<Network, StargateClient>();
  return {
    async load(network: Network) {
      const {
        addresses,
        balances,
        client,
      } = await context.services.ibc.createWalletByNetwork(network);

      clients.set(network, client);

      return {
        connected: true,
        address: addresses[0],
        balances,
      };
    },

    async getBalances(network: Network, address: string) {
      const client = clients.get(network);
      if (!client)
        throw new Error(
          `Cannot get balances for ${network}, not yet connected.`,
        );
      return context.services.ibc.getAllBalances({
        client,
        network,
        address,
      });
    },

    async disconnect(network: Network) {
      clients.delete(network);
      return;
    },
  };
}
