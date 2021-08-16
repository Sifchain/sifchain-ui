import { useCore } from "./useCore";

export const useChains = () => {
  return useCore().services.chains;
};

export const useChainsList = () => {
  return useCore().services.chains.list();
};
