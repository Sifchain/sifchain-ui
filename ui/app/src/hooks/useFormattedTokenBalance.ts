import { computed } from "@vue/reactivity";
import { Ref } from "vue";

import { useCore } from "./useCore";
import { formatAssetAmount } from "@/componentsLegacy/shared/utils";
export const useFormattedTokenBalance = (tokenSymbol: Ref<string | null>) => {
  const { store } = useCore();
  const getAccountBalance = () => {
    return store.wallet.sif.balances.find(
      (balance) => balance.asset.symbol === tokenSymbol.value,
    );
  };
  const formattedTokenBalance = computed(() => {
    const accountBalance = getAccountBalance();

    if (!accountBalance) return "0";
    return formatAssetAmount(accountBalance);
  });
  return formattedTokenBalance;
};
