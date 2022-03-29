import { reactive } from "@vue/reactivity";
import { Asset } from "@sifchain/sdk";

export type AssetStore = {
  topTokens: Asset[];
};

export const asset = reactive({
  topTokens: [],
}) as AssetStore;
