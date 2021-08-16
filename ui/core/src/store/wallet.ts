import { reactive } from "@vue/reactivity";
import { CryptoeconomicsUserData } from "../services/CryptoeconomicsService";
import { Address, IAssetAmount } from "../entities";

export interface WalletStore {
  eth: {
    chainId?: string;
    balances: IAssetAmount[];
    isConnected: boolean;
    address: Address;
  };
  sif: {
    balances: IAssetAmount[];
    isConnected: boolean;
    address: Address;
    vsUserData: CryptoeconomicsUserData;
    lmUserData: CryptoeconomicsUserData;
  };
  cosmoshub: {
    chainId?: string;
    balances: IAssetAmount[];
    isConnected: boolean;
    address: Address;
  };
  iris: {
    chainId?: string;
    balances: IAssetAmount[];
    isConnected: boolean;
    address: Address;
  };
}

export const wallet = reactive<WalletStore>({
  eth: {
    isConnected: false,
    address: "",
    balances: [],
  },
  sif: {
    isConnected: false,
    address: "",
    balances: [],
    vsUserData: null,
    lmUserData: null,
  },
  cosmoshub: {
    isConnected: false,
    address: "",
    balances: [],
  },
  iris: {
    isConnected: false,
    address: "",
    balances: [],
  },
}) as WalletStore;
