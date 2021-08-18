import { IAssetAmount } from "../../../entities";

export default function diffBalances(b1: IAssetAmount[], b2: IAssetAmount[]) {
  const getAssetAmountKeys = (balances: IAssetAmount[]) =>
    balances.map((b) => {
      return `${b.symbol}_${b.amount.toBigInt().toString()}`;
    });
  const mapped1 = getAssetAmountKeys(b1).join(" ");
  const mapped2 = getAssetAmountKeys(b2).join(" ");

  return mapped1 !== mapped2;
}
