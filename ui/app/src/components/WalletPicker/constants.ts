import { computed, ComputedRef } from "@vue/reactivity";
import { AppConfig, Chain, getChainsService, Network } from "@sifchain/sdk";
import { useCore } from "@/hooks/useCore";
import { rootStore } from "../../store";
import { accountStore } from "@/store/modules/accounts";
import { useChains } from "@/hooks/useChains";

export type WalletConnection = {
  walletName: string;
  walletIconSrc: string;
  getChain: () => Chain;
  connect: () => any;
  disconnect?: () => any;
};

type WalletConfig = {
  id: "keplr" | "metamask";
  walletName: string;
  walletIconSrc: string;
};
const walletConfigLookup: Record<WalletConfig["id"], WalletConfig> = {
  metamask: {
    id: "metamask",
    walletName: "Metamask",
    walletIconSrc: require("@/assets/metamask.png"),
  },
  keplr: {
    id: "keplr",
    walletName: "Keplr",
    walletIconSrc: require("@/assets/keplr.jpg"),
  },
};

const createWalletConnection = (
  walletId: WalletConfig["id"],
  network: Network,
): WalletConnection => ({
  ...walletConfigLookup[walletId],
  getChain: () => useChains().get(network),
  connect: () => accountStore.load(network),
  disconnect:
    network === Network.ETHEREUM
      ? () => {
          return accountStore.disconnect(network);
        }
      : undefined,
});

export const walletConnections: WalletConnection[] = [
  createWalletConnection("keplr", Network.SENTINEL),
  createWalletConnection("keplr", Network.AKASH),
  // createWalletConnection("keplr", Network.IRIS),
  createWalletConnection("keplr", Network.COSMOSHUB),
  createWalletConnection("metamask", Network.ETHEREUM),
  createWalletConnection("keplr", Network.SIFCHAIN),
];
