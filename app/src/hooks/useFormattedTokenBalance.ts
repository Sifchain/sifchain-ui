import { computed, Ref } from "vue";
import { IAssetAmount } from "@sifchain/sdk";

import { formatAssetAmount } from "~/components/utils";
import { accountStore } from "~/store/modules/accounts";

export function useFormattedTokenBalance(tokenSymbol: Ref<string | null>) {
  const accountBalance = useTokenBalance(tokenSymbol);

  const formattedTokenBalance = computed(() => {
    if (!accountBalance.value) return "0";
    return formatAssetAmount(accountBalance.value);
  });

  return formattedTokenBalance;
}

export function useTokenBalance(
  tokenSymbol: Ref<string | null>,
): Ref<IAssetAmount | undefined> {
  return computed(() =>
    accountStore.refs.sifchain.balances
      .computed()
      .value.find((balance) =>
        [
          balance.asset.symbol.toUpperCase(),
          balance.asset.displaySymbol.toUpperCase(),
        ].includes(tokenSymbol?.value?.toUpperCase() || ""),
      ),
  );
}
