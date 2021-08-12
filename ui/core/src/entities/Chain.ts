import { IAsset } from "../";
import { Network } from "./Network";

export type JsonChainConfig = {
  id: string;
  displayName: string;
  blockExplorerUrl: string;
  nativeAssetSymbol: string;
};

export type Chain = {
  id: string;
  displayName: string;
  blockExplorerUrl: string;

  nativeAsset: IAsset;
  assets: IAsset[];

  findAssetWithLikeSymbol(symbol: string): IAsset | undefined;
  getBlockExplorerUrlForTxHash(hash: string): string;

  // Preserve a link between Network enum and Chain object so
  // that we can map to legacy parts of the application that use Network enums.
  network: Network;
};
