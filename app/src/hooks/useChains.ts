import { Network } from "@sifchain/sdk";
import { useCore } from "./useCore";

export const useChains = () => {
  return useCore().services.chains;
};

export const useChainsList = () => {
  return useCore().services.chains.list();
};

export const useNativeChain = () => useChains().get(Network.SIFCHAIN);
