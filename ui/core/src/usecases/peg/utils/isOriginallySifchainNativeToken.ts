import { IAsset } from "../../../entities";

export function isOriginallySifchainNativeToken(asset: IAsset) {
  return ["erowan", "rowan", "uphoton"].includes(asset.symbol);
}
