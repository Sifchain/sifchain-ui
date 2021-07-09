import { ref } from "vue";
import { sortAssetAmount } from "../utils/sortAssetAmount";
import { useCore } from "@/hooks/useCore";
import { computed, reactive, effect } from "@vue/reactivity";
import { useTokenList } from "@/hooks/useTokenList";
import { IAsset, Network } from "@sifchain/sdk";

export type BalancePageState = {
  searchQuery: string;
  expandedSymbol: string;
};

export const useBalancePageData = (initialState: BalancePageState) => {
  const state = reactive(initialState);
  const tokenList = useTokenList({
    networks: ref([Network.SIFCHAIN]),
  });

  return {
    state,
    tokenList,
  };
};
