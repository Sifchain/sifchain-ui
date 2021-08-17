import { Chain, JsonChainConfig, IAsset, Network } from "../../../entities";
import { isLikeSymbol } from "../../../utils/isLikeSymbol";

export class BaseChain implements Chain {
  id = "_base";
  displayName = "_Base";
  network = Network.SIFCHAIN;
  assets: IAsset[];
  nativeAsset: IAsset;
  blockExplorerUrl: string;

  constructor(params: { assets: IAsset[]; chainConfig: JsonChainConfig }) {
    if (!params.chainConfig) {
      throw new Error(`Missing chainConfig for chain id ${this.id}`);
    }

    this.assets = params.assets.filter(
      (a) => a.network === params.chainConfig.network,
    );
    this.nativeAsset = this.assets.find(
      (a) => a.symbol === params.chainConfig.nativeAssetSymbol,
    ) as IAsset;
    this.blockExplorerUrl = params.chainConfig.blockExplorerUrl;
  }

  findAssetWithLikeSymbol(symbol: string) {
    return this.assets.find((asset) => isLikeSymbol(asset.symbol, symbol));
  }
  findAssetWithLikeSymbolOrThrow(symbol: string) {
    const asset = this.assets.find((asset) =>
      isLikeSymbol(asset.symbol, symbol),
    );
    if (!asset)
      throw new Error(`Asset ${symbol} not found in chain ${this.id}`);
    return asset;
  }

  getBlockExplorerUrlForTxHash(hash: string) {
    return `${this.blockExplorerUrl}/tx/${hash}`;
  }
}
