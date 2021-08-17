import { IAsset, WalletType } from "../";
import { Network } from "./Network";
import { ChainsService } from "../services/ChainsService";

export type JsonChainConfig = {
  network: string;
  displayName: string;
  blockExplorerUrl: string;
  nativeAssetSymbol: string;
};

export interface Chain {
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
}

let chainsService: ChainsService;
export const getChainsService = () => chainsService;
export const setChainsService = (c: ChainsService) => (chainsService = c);
