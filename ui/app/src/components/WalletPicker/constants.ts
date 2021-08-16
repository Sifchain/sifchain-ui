import { computed, ComputedRef } from "@vue/reactivity";
import { AppConfig, Network } from "@sifchain/sdk";
import { useCore } from "@/hooks/useCore";
import { rootStore } from "../../store";

export type WalletConnection = {
  walletName: string;
  network: Network;
  networkTokenSymbol: string;
  walletIconSrc: string;
  getAddressExplorerUrl: (config: AppConfig, address: string) => string;
  useWalletState: () => ComputedRef<{
    isConnected: boolean;
    address: string;
  }>;
  useWalletApi: () => ComputedRef<{
    connect: () => any;
    disconnect?: () => any; // Keplr has no disconnect so it's optional...?
  }>;
};

export const walletConnections: WalletConnection[] = [
  {
    walletName: "Metamask",
    network: Network.ETHEREUM,
    networkTokenSymbol: "eth",
    walletIconSrc: require("@/assets/metamask.png"),
    getAddressExplorerUrl: (config: AppConfig, address: string) => {
      return `https://etherscan.io/address/${address}`;
    },
    useWalletState: () => {
      return rootStore.accounts.computed((s) => {
        return {
          isConnected: s.state.ethereum.connected,
          address: s.state.ethereum.address,
        };
      });
    },
    useWalletApi: () => {
      const { usecases } = useCore();
      return computed(() => ({
        connect: () => usecases.wallet.eth.connectToEthWallet(),
        disconnect: () => usecases.wallet.eth.disconnectEthWallet(),
      }));
    },
  },
  {
    walletName: "Keplr",
    networkTokenSymbol: "rowan",
    network: Network.SIFCHAIN,
    walletIconSrc: require("@/assets/keplr.jpg"),
    getAddressExplorerUrl: (config: AppConfig, address: string) => {
      return `${config.blockExplorerUrl}/account/${address}`;
    },
    useWalletState: () => {
      const { store } = useCore();
      return computed(() => store.wallet.sif);
    },
    useWalletApi: () => {
      const { usecases } = useCore();
      return computed(() => ({
        connect: () => usecases.wallet.sif.connectToSifWallet(),
        disconnect: undefined,
      }));
    },
  },
  {
    walletName: "Keplr",
    network: Network.COSMOSHUB,
    networkTokenSymbol: "uphoton",
    walletIconSrc: require("@/assets/keplr.jpg"),
    getAddressExplorerUrl: (config: AppConfig, address: string) => {
      return `https://www.mintscan.io/cosmos/account/${address}`;
    },
    useWalletState: () => {
      return rootStore.accounts.computed((s) => {
        const w = s.state.cosmoshub;
        return {
          isConnected: w.connected,
          address: w.address,
        };
      });
    },
    useWalletApi: () => {
      const { usecases } = useCore();
      return computed(() => ({
        connect: () =>
          rootStore.accounts.loadIBCAccount({ network: Network.COSMOSHUB }),
        disconnect: undefined,
      }));
    },
  },
  {
    walletName: "Keplr",
    network: Network.IRIS,
    networkTokenSymbol: "unyan",
    walletIconSrc: require("@/assets/keplr.jpg"),
    getAddressExplorerUrl: (config: AppConfig, address: string) => {
      return config.chains.iris.blockExplorerUrl + "/address/" + address;
    },
    useWalletState: () => {
      return rootStore.accounts.computed((s) => {
        const w = s.state.iris;
        return {
          isConnected: w.connected,
          address: w.address,
        };
      });
    },
    useWalletApi: () => {
      return computed(() => ({
        connect: () =>
          rootStore.accounts.loadIBCAccount({ network: Network.IRIS }),
        disconnect: undefined,
      }));
    },
  },
];
