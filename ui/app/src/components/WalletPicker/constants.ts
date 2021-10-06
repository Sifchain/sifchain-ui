import { computed, ComputedRef } from "@vue/reactivity";
import {
  AppConfig,
  Chain,
  getChainsService,
  IBCChainConfig,
  Network,
} from "@sifchain/sdk";
import { useCore } from "@/hooks/useCore";
import { rootStore } from "../../store";
import { accountStore } from "@/store/modules/accounts";
import { useChains, useChainsList } from "@/hooks/useChains";
import getKeplrProvider from "@sifchain/sdk/src/services/SifService/getKeplrProvider";

import metamaskSrc from "@/assets/metamask.png";
import keplrSrc from "@/assets/keplr.jpg";
import router from "@/router";

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
    walletIconSrc: metamaskSrc,
  },
  keplr: {
    id: "keplr",
    walletName: "Keplr",
    walletIconSrc: keplrSrc,
  },
};

const createWalletConnection = (
  walletId: WalletConfig["id"],
  network: Network,
): WalletConnection => {
  const chain = useChains().get(network);
  return {
    ...walletConfigLookup[walletId],
    getChain: () => chain,
    connect: async () => {
      if (chain.chainConfig.chainType === "ibc") {
        if (!(window as any).keplr) {
          // A low-budget way to give the KeplrModal power to redirect user back to where they were.
          (window as any).keplrModalReferrer = window.location.href;
          router.push({ name: "KeplrInfo" });
          return;
        }
        const keplr = await getKeplrProvider();
        if (
          keplr &&
          useChains().get(Network.SIFCHAIN).chainConfig.chainId === "sifchain"
        ) {
          const configs = useChainsList()
            .filter((chain) => chain.chainConfig.chainType === "ibc")
            .map((chain) => chain.chainConfig as IBCChainConfig);
          await (window as any).keplr.enable(
            ...configs.map((chainConfig) => chainConfig.keplrChainInfo.chainId),
          );
        }
      }
      accountStore.load(network);
    },
    disconnect:
      network === Network.ETHEREUM
        ? () => {
            return accountStore.disconnect(network);
          }
        : undefined,
  };
};

// Sif, then eth, then all others alphabetically
export const walletConnections: WalletConnection[] = [
  createWalletConnection("keplr", Network.SIFCHAIN),
  createWalletConnection("metamask", Network.ETHEREUM),
  ...Object.values(Network)
    .filter((n) => n !== Network.SIFCHAIN && n !== Network.ETHEREUM)
    .map((n) => createWalletConnection("keplr", n))
    .sort((a, b) =>
      a.getChain().displayName.localeCompare(b.getChain().displayName),
    ),
]
  .filter((connection) => {
    return !connection.getChain().chainConfig.hidden;
  })
  // UI displays these bottom to top
  .reverse();
