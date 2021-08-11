import { IAsset } from "../../../entities";

export function isOriginallyNetworkNativeToken(asset: IAsset) {
  return ["erowan", "rowan", "uphoton", "euphoton"].includes(
    asset.symbol.toLowerCase(),
  );
}
