import { computed } from "@vue/reactivity";
import { Ref } from "vue";

import { formatAssetAmount } from "@/componentsLegacy/shared/utils";
import { accountStore } from "@/store/modules/accounts";
export const useFormattedTokenBalance = (tokenSymbol: Ref<string | null>) => {
  const getAccountBalance = () => {
    // alert("getting account balance");
    return accountStore.refs.sifchain.balances
      .computed()
      .value.find((balance) =>
        [
          balance.asset.symbol.toUpperCase(),
          balance.asset.displaySymbol.toUpperCase(),
        ].includes(tokenSymbol?.value?.toUpperCase() || ""),
      );
  };
  const formattedTokenBalance = computed(() => {
    const accountBalance = getAccountBalance();
    if (!accountBalance) return "0";
    return formatAssetAmount(accountBalance);
  });
  return formattedTokenBalance;
};
