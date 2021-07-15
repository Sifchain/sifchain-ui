import { ref } from "vue";
import { sortAssetAmount } from "../utils/sortAssetAmount";
import { useCore } from "@/hooks/useCore";
import { computed, reactive, effect } from "@vue/reactivity";
import { useTokenList, TokenListItem } from "@/hooks/useToken";
import { IAsset, Network } from "@sifchain/sdk";
import { config } from "storybook-addon-designs";

export type BalancePageState = {
  searchQuery: string;
  expandedSymbol: string;
  sortBy: "balance" | "name";
  sortDirection: "asc" | "desc";
};

export const useBalancePageData = (initialState: BalancePageState) => {
  const state = reactive(initialState);
  const tokenList = useTokenList({
    networks: ref([Network.SIFCHAIN]),
  });

  const displayedTokenList = computed<TokenListItem[]>(() => {
    if (!tokenList.value) return [];

    const array = tokenList.value.filter((token) => {
      if (!state.searchQuery) return true;
      return (
        (token.asset.displaySymbol || token.asset.symbol)
          .toLowerCase()
          .indexOf(state.searchQuery) !== -1 ||
        token.asset.label.toLowerCase().indexOf(state.searchQuery) !== -1
      );
    });

    if (state.sortBy === "name") {
      // Do nothing. already sorted by name.
    } else {
      array.sort((a: TokenListItem, b: TokenListItem) => {
        return (
          parseFloat(a.amount.amount.toString()) -
          parseFloat(b.amount.amount.toString())
        );
      });
    }

    if (state.sortDirection === "desc") {
      array.reverse();
    }
    return array;
  });

  return {
    state,
    displayedTokenList,
  };
};
