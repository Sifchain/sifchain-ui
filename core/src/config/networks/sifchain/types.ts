import { IAsset } from "../../../entities";

export type ChainAssetConfig = {
  assets: (Omit<IAsset, "homeNetwork" | "network"> & {
    network: "sifchain";
    homeNetwork: string;
  })[];
};
