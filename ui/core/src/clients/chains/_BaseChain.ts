import {
  Chain,
  IAsset,
  Network,
  ChainConfig,
  IAssetAmount,
  AssetAmount,
  getChainsService,
} from "../../entities";
import { isLikeSymbol } from "../../utils/isLikeSymbol";
import { urlJoin } from "url-join-ts";

export class BaseChain implements Chain {
  get network() {
    return this.chainConfig.network;
  }
  get displayName() {
    return this.chainConfig.displayName;
  }

  chainConfig: ChainConfig;
  assets: IAsset[];
  assetMap: Map<string, IAsset>;
  nativeAsset: IAsset;

  constructor(public context: { assets: IAsset[]; chainConfig: ChainConfig }) {
    this.chainConfig = context.chainConfig;

    this.assets = context.assets.filter(
      (a) => a.network === context.chainConfig.network,
    );

    this.assetMap = new Map();
    this.assets.forEach((asset) => {
      this.assetMap.set(asset.symbol, asset);
    });
    this.nativeAsset = this.assets.find(
      (a) => a.symbol === context.chainConfig.nativeAssetSymbol,
    ) as IAsset;
  }

  calculateTransferFeeToChain(assetAmount: IAssetAmount) {
    const rowan = getChainsService()
      .get(Network.SIFCHAIN)
      .findAssetWithLikeSymbolOrThrow("rowan");

    // Default 0 fee
    return AssetAmount(rowan, "0");
  }

  lookupAsset(symbol: string) {
    return this.assetMap.get(symbol);
  }
  lookupAssetOrThrow(symbol: string) {
    const asset = this.lookupAsset(symbol);
    if (!asset) {
      throw new Error(
        `Asset with symbol ${symbol} not found in chain ${this.displayName}`,
      );
    }
    return asset;
  }

  findAssetWithLikeSymbol(symbol: string) {
    return this.assets.find((asset) => isLikeSymbol(asset.symbol, symbol));
  }
  findAssetWithLikeSymbolOrThrow(symbol: string) {
    const asset = this.assets.find((asset) =>
      isLikeSymbol(asset.symbol, symbol),
    );
    if (!asset)
      throw new Error(`Asset ${symbol} not found in chain ${this.displayName}`);
    return asset;
  }

  getBlockExplorerUrlForTxHash(hash: string) {
    return urlJoin(this.chainConfig.blockExplorerUrl, "transactions", hash);
  }
  getBlockExplorerUrlForAddress(address: string) {
    return urlJoin(this.chainConfig.blockExplorerUrl, "accounts", address);
  }
}
