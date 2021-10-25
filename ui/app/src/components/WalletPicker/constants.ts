import keplrSrc from "@/assets/keplr.jpg";
import metamaskSrc from "@/assets/metamask.png";
import terraStationSrc from "@/assets/terra_station.png";
import { useChains, useChainsList } from "@/hooks/useChains";
import router from "@/router";
import { accountStore } from "@/store/modules/accounts";
import { isChainFlaggedDisabled } from "@/store/modules/flags";
import { Chain, IBCChainConfig, Network } from "@sifchain/sdk";
import getKeplrProvider from "@sifchain/sdk/src/services/SifService/getKeplrProvider";

export type WalletConnection = {
  walletName: string;
  walletIconSrc: string;
  getChain: () => Chain;
  connect: () => any;
  disconnect?: () => any;
};

type WalletConfig = {
  id: "keplr" | "metamask" | "terraStation";
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
  terraStation: {
    id: "terraStation",
    walletName: "Terra Station",
    walletIconSrc: terraStationSrc,
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
        return accountStore.load(network);
      }
    },
    disconnect:
      network === Network.ETHEREUM
        ? () => {
            return accountStore.disconnect(network);
          }
        : undefined,
  };
};

const walletPickerByNetwork: Record<string, WalletConfig["id"]> = {
  [Network.SIFCHAIN]: "keplr",
  [Network.ETHEREUM]: "metamask",
  [Network.TERRA]: "terraStation",
  default: "keplr",
};

const manuallyOrderedNetworks = [
  Network.SIFCHAIN,
  Network.ETHEREUM,
  Network.TERRA,
];
// Sif, then eth, then all others alphabetically
export const walletConnections: WalletConnection[] = [
  ...manuallyOrderedNetworks,
  ...Object.values(Network)
    .filter((n) => !manuallyOrderedNetworks.includes(n))
    .sort((a, b) =>
      useChains()
        .get(a)
        .displayName.localeCompare(useChains().get(b).displayName),
    ),
]
  .filter((network) => {
    return !useChains().get(network).chainConfig.hidden;
  })
  .map((n) =>
    createWalletConnection(
      walletPickerByNetwork[n] || walletPickerByNetwork.default,
      n,
    ),
  )
  // UI displays these bottom to top
  .reverse();
