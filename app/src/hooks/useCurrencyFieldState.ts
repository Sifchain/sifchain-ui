import { Ref, ref } from "vue";
import { watchEffect } from "vue";

type CurrencyFieldState = {
  fromSymbol: Ref<string | null>;
  fromAmount: Ref<string>;
  toSymbol: Ref<string | null>;
  toAmount: Ref<string>;
};

// Store global state between pages
const globalState = {
  fromSymbol: ref<string | null>("cdai"),
  toSymbol: ref<string | null>("rowan"),
};

export function useCurrencyFieldState(options?: {
  pooling: Ref<boolean | null>;
}): CurrencyFieldState {
  // Copy global state when creating page state
  const fromSymbol = ref<string | null>(globalState.fromSymbol.value);
  const toSymbol = ref<string | null>(globalState.toSymbol.value);

  if (options && options.pooling) {
    toSymbol.value = "rowan";
  }
  // Local page state
  const fromAmount = ref<string>("0");
  const toAmount = ref<string>("0");

  // Update global state whenchanges occur as sideeffects
  watchEffect(() => (globalState.fromSymbol.value = fromSymbol.value));
  watchEffect(() => (globalState.toSymbol.value = toSymbol.value));

  return {
    fromSymbol,
    fromAmount,
    toSymbol,
    toAmount,
  };
}
