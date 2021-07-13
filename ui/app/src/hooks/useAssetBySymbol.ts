import { computed } from "@vue/reactivity";
import { Ref } from "vue";
import { IAsset } from "../../../core/src";
import { useCore } from "./useCore";

export const useAssetBySymbol = (tokenSymbol: Ref<string | null>) => {
  const core = useCore();
  const asset = computed(() => {
    return core.config.assets.find(
      (asset) =>
        asset.symbol.toLowerCase() == tokenSymbol.value?.toLowerCase() ||
        asset.symbol.toLowerCase() == `c${tokenSymbol.value?.toLowerCase()}`,
    );
  });
  console.log("asset.value", asset.value);
  return asset;
};
