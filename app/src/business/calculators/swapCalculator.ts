import { Ref, computed, effect, ref } from "vue";
import {
  AssetAmount,
  IPool,
  CompositePool,
  IAssetAmount,
  Amount,
  format,
  IAsset,
} from "@sifchain/sdk";

import { useField } from "./useField";
import { trimZeros, useBalances } from "./utils";
export enum SwapState {
  ZERO_AMOUNTS,
  INSUFFICIENT_FUNDS,
  VALID_INPUT,
  INVALID_AMOUNT,
  INSUFFICIENT_LIQUIDITY,
  FRONTRUN_SLIPPAGE,
  INVALID_SLIPPAGE,
}

function calculateFormattedPriceImpact(pair: IPool, amount: IAssetAmount) {
  return format(pair.calcPriceImpact(amount), {
    mantissa: 6,
    trimMantissa: true,
  });
}

function calculateFormattedProviderFee(pair: IPool, amount: IAssetAmount) {
  return format(
    pair.calcProviderFee(amount).amount,
    pair.calcProviderFee(amount).asset,
    { mantissa: 5, trimMantissa: true },
  );
}

// TODO: make swap calculator only generate Fractions/Amounts that get stringified in the view
export function useSwapCalculator(input: {
  fromAmount: Ref<string>;
  fromSymbol: Ref<string | null>;
  toAmount: Ref<string>;
  toSymbol: Ref<string | null>;
  balances: Ref<IAssetAmount[]>;
  selectedField: Ref<"from" | "to" | null>;
  slippage: Ref<string>;
  poolFinder: (a: IAsset | string, b: IAsset | string) => Ref<IPool> | null;
}) {
  // extracting selectedField so we can use it without tracking its change
  let selectedField: "from" | "to" | null = null;
  effect(() => (selectedField = input.selectedField.value));

  // We use a composite pool pair to work out rates
  const pool = computed<IPool | null>(() => {
    if (!input.fromSymbol.value || !input.toSymbol.value) return null;

    if (input.fromSymbol.value === "rowan") {
      return input.poolFinder(input.toSymbol.value, "rowan")?.value ?? null;
    }

    if (input.toSymbol.value === "rowan") {
      return input.poolFinder(input.fromSymbol.value, "rowan")?.value ?? null;
    }

    const fromPair = input.poolFinder(input.fromSymbol.value, "rowan");
    const toPair = input.poolFinder(input.toSymbol.value, "rowan");

    if (!fromPair || !toPair) return null;

    return new CompositePool(fromPair.value, toPair.value);
  });

  // Get the balance of the from the users account
  const balance = computed(() => {
    const balanceMap = useBalances(input.balances);
    return input.fromSymbol.value
      ? balanceMap.value.get(input.fromSymbol.value) ?? null
      : null;
  });

  // Get field amounts as domain objects
  const fromField = useField(input.fromAmount, input.fromSymbol);
  const toField = useField(input.toAmount, input.toSymbol);

  const priceRatio = computed(() => {
    if (!fromField.value.fieldAmount || !pool.value) {
      return "0.0";
    }

    const amount = fromField.value.fieldAmount.equalTo("0")
      ? AssetAmount(fromField.value.fieldAmount.asset, "1")
      : fromField.value.fieldAmount;

    const pair = pool.value;

    const swapResult = pair.calcSwapResult(amount);

    // to get ratio needs to be divided by amount as input by user
    const amountAsInput = format(amount.amount, amount.asset);

    let formatted;
    try {
      formatted = format(swapResult.divide(amountAsInput), swapResult.asset, {
        mantissa: 6,
      });
    } catch (error) {
      if (/division by zero/i.test((error as Error).message)) {
        formatted = "0.0";
      } else {
        throw error;
      }
    }
    return formatted;
  });

  const priceMessage = computed(() => {
    if (!Number(priceRatio.value)) {
      return "";
    }

    return [
      priceRatio.value,
      fromField.value.asset?.displaySymbol.toUpperCase(),
      "per",
      toField.value.asset?.displaySymbol.toUpperCase(),
    ].join(" ");
  });

  // Selected field changes when the user changes the field selection
  // If the selected field is the "tokenA" field and something changes we change the "tokenB" input value
  // If the selected field is the "tokenB" field and something changes we change the "tokenA" input value

  // Changing the "from" field recalculates the "to" amount
  const swapResult = ref<IAssetAmount | null>(null);

  effect(() => {
    if (
      pool.value &&
      fromField.value.asset &&
      fromField.value.fieldAmount &&
      pool.value.contains(fromField.value.asset) &&
      selectedField === "from"
    ) {
      swapResult.value = pool.value.calcSwapResult(fromField.value.fieldAmount);

      const toAmountValue = format(
        swapResult.value.amount,
        swapResult.value.asset,
        {
          mantissa: 10,
          trimMantissa: true,
        },
      );

      input.toAmount.value = toAmountValue;
    }
  });

  // Changing the "to" field recalculates the "from" amount
  const reverseSwapResult = ref<IAssetAmount | null>(null);

  effect(() => {
    if (
      pool.value &&
      toField.value.asset &&
      toField.value.fieldAmount &&
      pool.value.contains(toField.value.asset) &&
      selectedField === "to"
    ) {
      reverseSwapResult.value = pool.value.calcReverseSwapResult(
        toField.value.fieldAmount,
      );

      // Internally trigger calulations based off swapResult as this is how we
      // work out priceImpact, providerFee, minimumReceived

      swapResult.value = pool.value.calcSwapResult(
        reverseSwapResult.value as IAssetAmount,
      );

      input.fromAmount.value = trimZeros(
        format(reverseSwapResult.value.amount, reverseSwapResult.value.asset, {
          mantissa: 8,
        }),
      );
    }
  });

  // Format input amount on blur
  effect(() => {
    if (input.selectedField.value === null && input.toAmount.value) {
      input.toAmount.value = trimZeros(input.toAmount.value);
    }
  });

  // Format input amount on blur
  effect(() => {
    if (input.selectedField.value === null && input.fromAmount.value) {
      input.fromAmount.value = trimZeros(input.fromAmount.value);
    }
  });

  // Cache pool contains asset for reuse as is a little
  const poolContainsFromAsset = computed(() => {
    if (!fromField.value.asset || !pool.value) return false;
    return pool.value.contains(fromField.value.asset);
  });

  const priceImpact = computed(() => {
    if (
      !pool.value ||
      !fromField.value.asset ||
      !fromField.value.fieldAmount ||
      !poolContainsFromAsset.value
    )
      return null;

    return calculateFormattedPriceImpact(
      pool.value as IPool,
      fromField.value.fieldAmount,
    );
  });

  const providerFee = computed(() => {
    if (
      !pool.value ||
      !fromField.value.asset ||
      !fromField.value.fieldAmount ||
      !poolContainsFromAsset.value
    )
      return null;

    return calculateFormattedProviderFee(
      pool.value as IPool,
      fromField.value.fieldAmount,
    );
  });

  // minimumReceived
  const minimumReceived = computed(() => {
    if (!input.slippage.value || !toField.value.asset || !swapResult.value)
      return null;

    const slippage = Amount(input.slippage.value);

    const minAmount = Amount("1")
      .subtract(slippage.divide(Amount("100")))
      .multiply(swapResult.value);

    return AssetAmount(toField.value.asset, minAmount);
  });

  // Derive state
  const state = computed(() => {
    // SwapState.INSUFFICIENT_LIQUIDITY is probably better here
    if (!pool.value) {
      return SwapState.INSUFFICIENT_LIQUIDITY;
    }
    const fromTokenLiquidity = (pool.value as IPool).amounts.find(
      (amount) => amount.asset.symbol === fromField.value.asset?.symbol,
    );
    const toTokenLiquidity = (pool.value as IPool).amounts.find(
      (amount) => amount.asset.symbol === toField.value.asset?.symbol,
    );

    if (
      !fromTokenLiquidity ||
      !toTokenLiquidity ||
      !fromField.value.fieldAmount ||
      !toField.value.fieldAmount ||
      (fromField.value.fieldAmount?.equalTo("0") &&
        toField.value.fieldAmount?.equalTo("0"))
    ) {
      return SwapState.ZERO_AMOUNTS;
    }

    if (
      toField.value.fieldAmount.greaterThan("0") &&
      fromField.value.fieldAmount.equalTo("0")
    ) {
      return SwapState.INVALID_AMOUNT;
    }

    if (!balance.value?.greaterThanOrEqual(fromField.value.fieldAmount || "0"))
      return SwapState.INSUFFICIENT_FUNDS;

    if (
      fromTokenLiquidity.lessThan(fromField.value.fieldAmount) ||
      toTokenLiquidity.lessThan(toField.value.fieldAmount)
    ) {
      return SwapState.INSUFFICIENT_LIQUIDITY;
    }

    // slippage > 50% can be social engineered as a non-option as to prevent traders from transacting without understanding the potential price volatility before their transaction will actually execute
    // user entering a negative slippage is not useful but hopefully works out for them
    if (
      Amount(input.slippage.value).greaterThan(Amount("50.001")) ||
      Amount(input.slippage.value).lessThan(Amount("0"))
    ) {
      return SwapState.INVALID_SLIPPAGE;
    }

    // slippage > 1% puts trader at risk of a frontrun attack
    if (Amount(input.slippage.value).greaterThan(Amount("1"))) {
      return SwapState.FRONTRUN_SLIPPAGE;
    }

    return SwapState.VALID_INPUT;
  });

  return {
    state,
    fromFieldAmount: fromField.value.fieldAmount,
    toFieldAmount: toField.value.fieldAmount,
    toAmount: input.toAmount,
    fromAmount: input.fromAmount,
    priceImpact,
    providerFee,
    minimumReceived,
    swapResult,
    reverseSwapResult,
    priceRatio,
    priceMessage,
  };
}
