import { Chain, Network } from "@sifchain/sdk";

import keplrSrc from "~/assets/keplr.jpg";
import metamaskSrc from "~/assets/metamask.png";
import terraStationSrc from "~/assets/terra_station.png";
import { useChains } from "~/hooks/useChains";
import { useCore } from "~/hooks/useCore";
import router from "~/router";
import { accountStore } from "~/store/modules/accounts";

export type WalletConnection = {
  walletName: string;
  walletIconSrc: string;
  getChain: () => Chain;
  connect: () => any;
  disconnect?: () => any;
};

export type WalletConfig = {
  id: "keplr" | "metamask" | "terraStation";
  walletName: string;
  walletIconSrc: string;
  instructions: any;
};
export const walletConfigLookup: Record<WalletConfig["id"], WalletConfig> = {
  metamask: {
    id: "metamask",
    walletName: "Metamask",
    walletIconSrc: metamaskSrc,
    instructions: (
      <>
        Sifchain uses the Metamask wallet extension to connect to the Ethereum
        ecosystem.
        <br />
        <br />
        Download and install it at{" "}
        <a
          target="_blank"
          href="https://metamask.io/"
          class="cursor-pointer underline"
        >
          https://metamask.io
        </a>
        .
        <br />
        <br />
        Once installed, refresh your browser and connect to Sifchain.
      </>
    ),
  },
  keplr: {
    id: "keplr",
    walletName: "Keplr",
    walletIconSrc: keplrSrc,
    instructions: (
      <>
        Sifchain uses the Keplr wallet extension to connect to the Cosmos
        ecosystem.
        <br />
        <br />
        Download and install it at{" "}
        <a
          target="_blank"
          href="https://keplr.app/"
          class="cursor-pointer underline"
        >
          https://keplr.app
        </a>
        .
        <br />
        <br />
        Once installed, refresh your browser and connect to Sifchain.
      </>
    ),
  },
  terraStation: {
    id: "terraStation",
    walletName: "Terra Station",
    walletIconSrc: terraStationSrc,
    instructions: (
      <>
        Sifchain uses the Terra Station wallet extension to connect to the Terra
        ecosystem.
        <br />
        <br />
        Download and install it at{" "}
        <a
          target="_blank"
          href="https://chrome.google.com/webstore/detail/terra-station/aiifbnbfobpmeekipheeijimdpnlpgpp?hl=en"
          class="cursor-pointer underline"
        >
          the Chrome Web Store
        </a>
        .
        <br />
        <br />
        Once installed, refresh your browser and connect to Sifchain.
      </>
    ),
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
      const walletService = useCore().services.wallet;
      const provider = walletService.getPreferredProvider(chain);

      if (!(await provider.isInstalled(chain))) {
        router.push({
          name: "WalletInstallModal",
          params: {
            walletId: walletId,
          },
          query: {
            redirectTo: window.location.href,
          },
        });
        return;
      }
      return accountStore.load(network);
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
