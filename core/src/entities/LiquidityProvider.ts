import { IAsset } from "./Asset";
import { IAmount } from "./Amount";

export class LiquidityProvider {
  asset: IAsset;
  units: IAmount;
  address: string;
  nativeAmount: IAmount;
  externalAmount: IAmount;

  constructor(
    asset: IAsset,
    units: IAmount,
    address: string,
    nativeAmount: IAmount,
    externalAmount: IAmount,
  ) {
    this.asset = asset;
    this.units = units;
    this.address = address;
    this.nativeAmount = nativeAmount;
    this.externalAmount = externalAmount;
  }
}
