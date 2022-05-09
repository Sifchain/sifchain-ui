import { IAsset } from "@sifchain/sdk";
import { Ref, computed, ComputedRef } from "vue";

import { useCore } from "./useCore";

export const useAssetBySymbol = (
  tokenSymbol: Ref<string | null>,
  { isDisplaySymbol = false } = {},
): ComputedRef<IAsset | undefined> => {
  const core = useCore();
  const asset = computed(() => {
    const key = isDisplaySymbol ? "displaySymbol" : "symbol";
    return core.config.assets.find(
      (asset) =>
        asset[key].toLowerCase() == tokenSymbol.value?.toLowerCase() ||
        asset[key].toLowerCase() == `c${tokenSymbol.value?.toLowerCase()}`,
    );
  });
  return asset;
};
