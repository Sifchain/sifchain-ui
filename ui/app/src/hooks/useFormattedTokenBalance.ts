import { computed } from "@vue/reactivity";
import { Ref } from "vue";
import { format } from "../../../core/src";
import { useCore } from "./useCore";

export const useFormattedTokenBalance = (tokenSymbol: Ref<string | null>) => {
  const { store } = useCore();
  const getAccountBalance = () => {
    return store.wallet.sif.balances.find(
      (balance) => balance.asset.symbol === tokenSymbol.value,
    );
  };
  const formattedTokenBalance = computed(() => {
    console.log("accountbalances");
    const accountBalance = getAccountBalance();
    console.log({ accountBalance });
    if (!accountBalance) return "0";
    return format(accountBalance.amount, accountBalance.asset);
  });
  return formattedTokenBalance;
};
