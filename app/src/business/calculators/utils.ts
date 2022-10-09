import { computed, Ref } from "vue";
import { IAssetAmount } from "@sifchain/sdk";

export function trimZeros(amount: string) {
  if (amount.indexOf(".") === -1) return `${amount}.0`;
  const tenDecimalsMax = parseFloat(amount).toFixed(10);
  return tenDecimalsMax.replace(/0+$/, "").replace(/\.$/, ".0");
}

export function useBalances(balances: Ref<IAssetAmount[]>) {
  return computed(() => {
    const map = new Map<string, IAssetAmount>();

    for (const item of balances.value) {
      map.set(item.asset.symbol, item);
    }

    return map;
  });
}
