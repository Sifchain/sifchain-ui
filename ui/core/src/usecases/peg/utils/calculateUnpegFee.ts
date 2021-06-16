import { Asset, AssetAmount, IAsset } from "../../../entities";
import { isOriginallySifchainNativeToken } from "./isOriginallySifchainNativeToken";

export function calculateUnpegFee(asset: IAsset) {
  const feeNumber = isOriginallySifchainNativeToken(asset)
    ? "23580000000000000"
    : "23580000000000000";

  return AssetAmount(Asset.get("ceth"), feeNumber);
}
