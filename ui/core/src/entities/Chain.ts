import { IAsset, WalletType, IAssetAmount } from "../";
import { Network } from "./Network";
import { ChainsService } from "../services/ChainsService";
import { ChainInfo } from "@keplr-wallet/types";

let chainsService: ChainsService;
export const getChainsService = () => chainsService;
export const setChainsService = (c: ChainsService) => (chainsService = c);

export type BaseChainConfig = {
  network: Network;
  hidden?: boolean;
  chainId: string;
  displayName: string;
  blockExplorerUrl: string;
  nativeAssetSymbol: string;
};
export type EthChainConfig = BaseChainConfig & {
  chainType: "eth";
};
export type IBCChainConfig = BaseChainConfig & {
  chainType: "ibc";
  rpcUrl: string;
  restUrl: string;
  keplrChainInfo: ChainInfo;
};

export type ChainConfig = IBCChainConfig | EthChainConfig;

export type NetworkChainConfigLookup = Record<Network, ChainConfig>;

export interface Chain {
  chainConfig: ChainConfig;
  network: Network;
  displayName: string;
  nativeAsset: IAsset;
  assets: IAsset[];
  assetMap: Map<string, IAsset>;

  calculateTransferFeeToChain(transferAmount: IAssetAmount): IAssetAmount;

  lookupAsset(symbol: string): IAsset | undefined;
  lookupAssetOrThrow(symbol: string): IAsset;

  findAssetWithLikeSymbol(symbol: string): IAsset | undefined;
  findAssetWithLikeSymbolOrThrow(symbol: string): IAsset;
  getBlockExplorerUrlForTxHash(hash: string): string;
  getBlockExplorerUrlForAddress(hash: string): string;
}
