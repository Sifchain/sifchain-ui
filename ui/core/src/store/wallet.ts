import { reactive } from "@vue/reactivity";
import { CryptoeconomicsUserData } from "../services/CryptoeconomicsService";

import { Address, IAssetAmount } from "../entities";

export type WalletStore = {
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
};

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
}) as WalletStore;
