import { Asset, AssetAmount, IAsset } from "../../../entities";
import { isOriginallyNetworkNativeToken } from "./isOriginallyNetworkNativeToken";

export function calculateUnpegFee(asset: IAsset) {
  const feeNumber = isOriginallyNetworkNativeToken(asset)
    ? "23580000000000000"
    : "23580000000000000";

  return AssetAmount(Asset.get("ceth"), feeNumber);
}
