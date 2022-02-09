import { computed, reactive, ref, toRefs } from "vue";
import { useTokenList, TokenListItem } from "@/hooks/useToken";
import { sortAndFilterTokens, TokenSortBy } from "@/utils/sortAndFilterTokens";
import { Network } from "@sifchain/sdk";
import { useBoundRoute } from "@/hooks/useBoundRoute";
import { accountStore } from "@/store/modules/accounts";

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

  const targetNetwork = Network.SIFCHAIN;

  const tokenList = useTokenList({
    networks: ref([targetNetwork]),
    showDecomissionedAssetsWithBalance: true,
  });

  const isLoadingBalances = accountStore.computed(
    ({ state }) => !state[targetNetwork].hasLoadedBalancesOnce,
  );

  const displayedTokenList = computed<TokenListItem[]>(() => {
    if (isLoadingBalances.value) return [];

    const out = sortAndFilterTokens({
      tokens: tokenList.value,
      searchQuery: state.searchQuery,
      sortBy: state.sortBy,
      reverse: state.reverse,
      network: targetNetwork,
    });
    return out;
  });

  return {
    state,
    displayedTokenList,
    isLoadingBalances,
  };
};
