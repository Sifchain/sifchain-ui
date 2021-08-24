import {
  getChainsService,
  Network,
  AssetAmount,
  IAssetAmount,
} from "../entities";

export function calculateIBCExportFee(transferAmount: IAssetAmount) {
  const rowan = getChainsService()
    .get(Network.SIFCHAIN)
    .findAssetWithLikeSymbolOrThrow("rowan");

  // ibc exports have .99 rowan fee
  return AssetAmount(rowan, "990000000000000000");
}
