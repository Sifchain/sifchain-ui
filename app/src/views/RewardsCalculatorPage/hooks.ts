import { useRowanPrice } from "@/componentsLegacy/RowanPrice/useRowanPrice";

export function useRewardsCalculatorData() {
  return {
    tokenOutPriceAsync: useRowanPrice(),
  };
}
