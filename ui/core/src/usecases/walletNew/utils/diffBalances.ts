import { IAssetAmount } from "../../../entities";

export default function diffBalances(b1: IAssetAmount[], b2: IAssetAmount[]) {
  const getAssetAmountKeys = (balances: IAssetAmount[]) =>
    balances.map((b) => {
      return `${b.symbol}_${b.amount.toBigInt.toString()}`;
    });

  const mapped1 = getAssetAmountKeys(b1);
  const mapped2 = getAssetAmountKeys(b2);
  return (
    mapped1.length === mapped2.length &&
    mapped1.every((item, index) => {
      return mapped2[index] === item;
    })
  );
}
