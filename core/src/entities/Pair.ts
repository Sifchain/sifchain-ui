import { IAsset } from "./Asset";
import { IAssetAmount } from "./AssetAmount";
import { createPoolKey } from "../";

export class Pair {
  amounts: [IAssetAmount, IAssetAmount];

  constructor(
    private nativeAsset: IAssetAmount,
    private externalAsset: IAssetAmount,
  ) {
    this.amounts = [nativeAsset, externalAsset];
  }

  otherAsset(asset: IAsset) {
    const otherAsset = this.amounts.find(
      (amount) => amount.symbol !== asset.symbol,
    );
    if (!otherAsset) {
      throw new Error("Asset doesnt exist in pair");
    }
    return otherAsset;
  }

  symbol() {
    return createPoolKey(this.externalAsset, this.nativeAsset);
  }

  contains(...assets: IAsset[]) {
    const local = this.amounts.map((a) => a.symbol);

    const other = assets.map((a) => a.symbol);

    return !!local.find((s) => other.includes(s));
  }

  getAmount(asset: IAsset | string) {
    const assetSymbol = typeof asset === "string" ? asset : asset.symbol;
    const found = this.amounts.find((amount) => {
      return amount.symbol === assetSymbol;
    });
    if (!found) throw new Error(`Asset ${assetSymbol} doesnt exist in pair`);
    return found;
  }

  toString() {
    return this.amounts.map((a) => a.toString()).join(" | ");
  }
}
