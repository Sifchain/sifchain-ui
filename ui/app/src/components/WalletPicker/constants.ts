import { computed, ComputedRef } from "@vue/reactivity";
import { AppConfig, Network } from "@sifchain/sdk";
import { useCore } from "@/hooks/useCore";
import { rootStore } from "../../store";

export type WalletConnection = {
  name: string;
  network: Network;
  iconSrc: string;
  getAddressExplorerUrl: (config: AppConfig, address: string) => string;
  useWalletState: () => ComputedRef<{
    isConnected: boolean;
    address: string;
  }>;
  useWalletApi: () => ComputedRef<{
    connect: () => Promise<any>;
    disconnect?: () => Promise<any>; // Keplr has no disconnect so it's optional...?
  }>;
};

export const walletConnections: WalletConnection[] = [
  {
    name: "Metamask",
    network: Network.ETHEREUM,
    iconSrc: require("@/assets/metamask.png"),
    getAddressExplorerUrl: (config: AppConfig, address: string) => {
      return `https://etherscan.io/address/${address}`;
    },
    useWalletState: () => {
      return computed(() => {
        const w = rootStore.accounts.state.ethereum;
        return {
          isConnected: w.connected,
          address: w.address,
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
    name: "KEPLR",
    network: Network.SIFCHAIN,
    iconSrc: require("@/assets/keplr.jpg"),
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
    name: "KEPLR",
    network: Network.COSMOSHUB,
    iconSrc: require("@/assets/keplr.jpg"),
    getAddressExplorerUrl: (config: AppConfig, address: string) => {
      return `https://www.mintscan.io/cosmos/account/${address}`;
    },
    useWalletState: () => {
      const { store } = useCore();
      return computed(() => store.wallet.cosmoshub);
    },
    useWalletApi: () => {
      const { usecases } = useCore();
      return computed(() => ({
        connect: () => usecases.wallet.sif.connectToSifWallet(),
        disconnect: undefined,
      }));
    },
  },
];
