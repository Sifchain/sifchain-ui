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
      (a) => a.network === params.chainConfig.id,
    );
    (this.nativeAsset = params.assets.find(
      (a) =>
        a.network === ((this.id as unknown) as Network) &&
        a.symbol === params.chainConfig.nativeAssetSymbol,
    ) as IAsset),
      (this.blockExplorerUrl = params.chainConfig.blockExplorerUrl);
  }

  findAssetWithLikeSymbol(symbol: string) {
    return this.assets.find((asset) => isLikeSymbol(asset.symbol, symbol));
  }

  getBlockExplorerUrlForTxHash(hash: string) {
    return `${this.blockExplorerUrl}/tx/${hash}`;
  }
}
