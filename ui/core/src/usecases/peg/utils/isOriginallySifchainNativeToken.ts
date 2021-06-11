import { IAsset } from "../../../entities";

export function isOriginallySifchainNativeToken(asset: IAsset) {
  return ["erowan", "rowan"].includes(asset.symbol);
}
