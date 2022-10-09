import { computed, Ref } from "vue";
import { Asset, AssetAmount } from "@sifchain/sdk";
import { toBaseUnits } from "@sifchain/sdk/src/utils";

export function useField(amount: Ref<string>, symbol: Ref<string | null>) {
  return computed(() => {
    const asset = !symbol.value ? null : Asset(symbol.value);
    const fieldAmount =
      !asset || !amount.value
        ? null
        : AssetAmount(asset, toBaseUnits(amount.value, asset));

    return { asset, fieldAmount };
  });
}
