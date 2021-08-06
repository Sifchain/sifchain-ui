import { computed, reactive, ref } from "vue";
import { useTokenList, TokenListItem } from "@/hooks/useToken";
import { sortAndFilterTokens, TokenSortBy } from "@/utils/sortAndFilterTokens";
import { Network } from "@sifchain/sdk";

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
