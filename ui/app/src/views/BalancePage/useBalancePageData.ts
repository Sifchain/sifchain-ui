import { sortAssetAmount } from "../utils/sortAssetAmount";
import { useCore } from "@/hooks/useCore";
import { onUnmounted, onMounted } from "vue";
import { computed, reactive, effect } from "@vue/reactivity";
import { useTokenList } from "@/hooks/useTokenList";
import { IAsset } from "@sifchain/sdk";

export type BalancePageState = {
  searchQuery: string;
  expandedSymbol: string;
  importSymbol: string;
};

const defaultState = {
  searchQuery: "",
  expandedSymbol: "",
  importSymbol: "",
};
const state = reactive(defaultState);

export const useSetupBalancePageData = (initialState: BalancePageState) => {
  onMounted(() => {
    Object.assign(state, initialState);
  });
  onUnmounted(() => {
    Object.assign(state, defaultState);
  });
};

export const useBalancePageData = () => {
  const tokenList = useTokenList({
    filter: state.searchQuery,
  });

  effect(() => {
    if (
      state.expandedSymbol &&
      !tokenList.value.some(
        (item) => item.asset.symbol === state.expandedSymbol,
      )
    ) {
      state.expandedSymbol = "";
    }
  });

  return {
    state,
    tokenList,
  };
};
