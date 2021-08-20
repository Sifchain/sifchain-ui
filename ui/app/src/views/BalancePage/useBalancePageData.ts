import { computed, reactive, ref, toRefs } from "vue";
import { useTokenList, TokenListItem } from "@/hooks/useToken";
import { sortAndFilterTokens, TokenSortBy } from "@/utils/sortAndFilterTokens";
import { Network } from "@sifchain/sdk";
import { useBoundRoute } from "@/hooks/useBoundRoute";

export type BalancePageState = {
  searchQuery: string;
  expandedSymbol: string;
  sortBy: TokenSortBy;
  reverse: boolean;
};

export const useBalancePageData = (initialState: BalancePageState) => {
  const state = reactive(initialState);

  const stateRefs = toRefs(state);
  useBoundRoute({
    params: {},
    query: {
      q: stateRefs.searchQuery,
      focused: stateRefs.expandedSymbol,
    },
  });
  const tokenList = useTokenList({
    networks: ref([Network.SIFCHAIN]),
    showDecomissionedAssetsWithBalance: true,
  });

  const displayedTokenList = computed<TokenListItem[]>(() => {
    if (!tokenList.value) return [];

    return sortAndFilterTokens({
      tokens: tokenList.value,
      searchQuery: state.searchQuery,
      sortBy: state.sortBy,
      reverse: state.reverse,
      network: Network.SIFCHAIN,
    });
  });

  return {
    state,
    displayedTokenList,
  };
};
