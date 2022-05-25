import { reactive } from "@vue/reactivity";
import { IAsset } from "@sifchain/sdk";

export type AssetStore = {
  topTokens: IAsset[];
};

export const asset = reactive({
  topTokens: [],
}) as AssetStore;
