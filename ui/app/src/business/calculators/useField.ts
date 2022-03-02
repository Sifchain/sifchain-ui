import { computed, Ref } from "@vue/reactivity";
import { Asset, AssetAmount } from "@sifchain/sdk";
import { toBaseUnits } from "@sifchain/sdk/src/utils";

export function useField(amount: Ref<string>, symbol: Ref<string | null>) {
  const asset = computed(() => {
    if (!symbol.value) return null;
    try {
      return Asset(symbol.value);
    } catch (error) {
      // Not ready yet
      return null;
    }
  });

  const fieldAmount = computed(() => {
    if (!asset.value || !amount.value) return null;
    return AssetAmount(asset.value, toBaseUnits(amount.value, asset.value));
  });

  return {
    fieldAmount,
    asset,
  };
}
