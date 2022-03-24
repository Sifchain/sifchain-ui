import { computed } from "@vue/reactivity";
import { Ref } from "vue";
import { IAsset } from "../../../core/src";
import { useCore } from "./useCore";

export const useAssetBySymbol = (
  tokenSymbol: Ref<string | null>,
  { isDisplaySymbol = false } = {},
) => {
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
