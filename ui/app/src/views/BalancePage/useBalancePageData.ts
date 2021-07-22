import { ref } from "vue";
import { sortAssetAmount } from "../utils/sortAssetAmount";
import { useCore } from "@/hooks/useCore";
import { computed, reactive, effect } from "@vue/reactivity";
import { useTokenList, TokenListItem } from "@/hooks/useToken";
import { sortAndFilterTokens, TokenSortBy } from "@/utils/sortAndFilterTokens";
import { IAsset, Network } from "@sifchain/sdk";
import { config } from "storybook-addon-designs";

export type BalancePageState = {
  searchQuery: string;
  expandedSymbol: string;
  sortBy: TokenSortBy;
  reverse: boolean;
};

export const useBalancePageData = (initialState: BalancePageState) => {
  const state = reactive(initialState);
  const tokenList = useTokenList({
    networks: ref([Network.SIFCHAIN]),
  });

  const displayedTokenList = computed<TokenListItem[]>(() => {
    if (!tokenList.value) return [];

    return sortAndFilterTokens({
      tokens: tokenList.value,
      searchQuery: state.searchQuery,
      sortBy: state.sortBy,
      reverse: state.reverse,
    });
  });

  return {
    state,
    displayedTokenList,
  };
};
