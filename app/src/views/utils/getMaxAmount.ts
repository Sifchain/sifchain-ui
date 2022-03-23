import { TransactionStatus } from "@sifchain/sdk";
import { effect, Ref, ref, ComputedRef } from "@vue/reactivity";
import { IAssetAmount, IAmount, Amount } from "@sifchain/sdk";

// We set this static fee to minus from some ROWAN transactions such
// that users don't have to manually minus it from KEPLR
const ROWAN_GAS_FEE = Amount("500000000000000000"); // 0.5 ROWAN

export function getMaxAmount(
  symbol: Ref<string | null>,
  accountBalance: IAssetAmount,
): IAmount {
  if (!symbol) {
    return Amount("0");
  }
  if (symbol.value !== "rowan") {
    return accountBalance;
  } else {
    if (accountBalance.greaterThan(ROWAN_GAS_FEE)) {
      return accountBalance.subtract(ROWAN_GAS_FEE);
    } else {
      return Amount("0");
    }
  }
}
