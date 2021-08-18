import { Network, WalletType, IAssetAmount } from "../../entities";
import { UsecaseContext } from "..";
import diffBalances from "./utils/diffBalances";
import { WalletActions } from "./types";
import { StargateClient } from "@cosmjs/stargate";

// TODO(ajoslin): handle account switches gracefully
window.addEventListener("keplr_keystorechange", () => window.location.reload());

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

    async getBalances(
      network: Network,
      current: {
        address: string;
        balances: IAssetAmount[];
      },
    ) {
      const client = clients.get(network);
      if (!client)
        throw new Error(
          `Cannot get balances for ${network}, not yet connected.`,
        );
      const balances = await context.services.ibc.getAllBalances({
        client,
        network,
        address: current.address,
      });
      // if (network === Network.SIFCHAIN) {
      //   console.log(
      //     "BALANCE",
      //     balances,
      //     diffBalances(current.balances, balances),
      //   );
      // }
      return {
        balances,
        changed: diffBalances(current.balances, balances),
      };
    },

    async disconnect(network: Network) {
      clients.delete(network);
      return;
    },
  };
}
