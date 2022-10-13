import { useRowanPrice } from "~/hooks/useRowanPrice";

export function useRewardsCalculatorData() {
  return {
    tokenOutPriceAsync: useRowanPrice(),
  };
}
