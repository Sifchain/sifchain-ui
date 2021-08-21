import { Chain, IAsset, Network, ChainConfig } from "../../entities";
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
  nativeAsset: IAsset;

  constructor(params: { assets: IAsset[]; chainConfig: ChainConfig }) {
    this.chainConfig = params.chainConfig;

    this.assets = params.assets.filter(
      (a) => a.network === params.chainConfig.network,
    );
    this.nativeAsset = this.assets.find(
      (a) => a.symbol === params.chainConfig.nativeAssetSymbol,
    ) as IAsset;
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
