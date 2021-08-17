import { reactive } from "@vue/reactivity";
import { CryptoeconomicsUserData } from "../services/CryptoeconomicsService";
import { Address, IAssetAmount, Network } from "../entities";

export type WalletStoreEntry = {
  chainId?: string;
  balances: IAssetAmount[];
  isConnected: boolean;
  address: Address;
  lmUserData?: CryptoeconomicsUserData;
  vsUserData?: CryptoeconomicsUserData;
};

const initWalletStore = () => ({
  isConnected: false,
  address: "",
  balances: [],
});

export type WalletStore = {
  // DEPRECATED //
  eth: WalletStoreEntry;
  sif: WalletStoreEntry;
  cosmoshub: WalletStoreEntry;
  iris: WalletStoreEntry;

  // NEW STUFF //
  _map: Map<Network, WalletStoreEntry>;
  get: (network: Network) => WalletStoreEntry;
  set: (network: Network, data: WalletStoreEntry) => void;
  reset: (network: Network) => void;
};

export const wallet = reactive<WalletStore>({
  // DEPRECATED
  eth: initWalletStore(),
  sif: initWalletStore(),
  cosmoshub: initWalletStore(),
  iris: initWalletStore(),

  _map: reactive(new Map()),
  get: (network: Network) => {
    let value = wallet._map.get(network);
    if (!value) {
      value = initWalletStore();
      wallet._map.set(network, value);
      return value;
    }
    return value;
  },
  set: (network: Network, data: WalletStoreEntry) => {
    wallet._map.set(network, data);
  },
  reset: (network: Network) => {
    wallet._map.set(network, initWalletStore());
  },
}) as WalletStore;
