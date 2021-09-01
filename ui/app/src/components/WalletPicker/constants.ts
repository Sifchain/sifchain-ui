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

export const walletConnections: WalletConnection[] = [
  createWalletConnection("keplr", Network.SENTINEL),
  createWalletConnection("keplr", Network.REGEN),
  createWalletConnection("keplr", Network.PERSISTENCE),
  createWalletConnection("keplr", Network.IRIS),
  createWalletConnection("keplr", Network.CRYPTO_ORG),
  createWalletConnection("keplr", Network.COSMOSHUB),
  createWalletConnection("keplr", Network.AKASH),
  createWalletConnection("metamask", Network.ETHEREUM),
  createWalletConnection("keplr", Network.SIFCHAIN),
].filter((connection) => {
  return !connection.getChain().chainConfig.hidden;
});
