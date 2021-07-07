import { computed, effect, reactive, ref } from "@vue/reactivity";
import { useCore } from "@/hooks/useCore";
import { SwapState, TransactionStatus, useSwapCalculator } from "@sifchain/sdk";
import { useWalletButton } from "@/componentsLegacy/WithWallet/useWalletButton";
import { useCurrencyFieldState } from "@/hooks/useCurrencyFieldState";
import { getMaxAmount } from "../utils/getMaxAmount";
import { format } from "@sifchain/sdk/src/utils/format";
import { nextTick, onMounted, watch, watchEffect } from "vue";
import { useTokenIconUrl } from "@/hooks/useTokenIconUrl";
type SwapPageState = "idle" | "confirm" | "submit" | "fail" | "success";

export const useSwapPageData = () => {
  const { usecases, poolFinder, store } = useCore();

  const fromSymbol = ref("rowan");
  const toSymbol = ref("cdai");
  const fromAmount = ref("1");
  const toAmount = ref("0");

  const slippage = ref<string>("1.0");
  const pageState = ref<SwapPageState>("idle");
  const txStatus = ref<TransactionStatus | null>(null);

  const selectedField = ref<"from" | "to" | null>(null);

  const fromTokenIconUrl = useTokenIconUrl({
    symbol: fromSymbol,
  });
  const toTokenIconUrl = useTokenIconUrl({
    symbol: toSymbol,
  });

  const { connected } = useWalletButton();

  function requestTransactionModalClose() {
    pageState.value = "idle";
  }

  const getAccountBalance = () => {
    return store.wallet.sif.balances.find(
      (balance) => balance.asset.symbol === fromSymbol.value,
    );
  };

  const formattedFromTokenBalance = computed(() => {
    console.log("accountbalances");
    const accountBalance = getAccountBalance();
    console.log({ accountBalance });
    if (!accountBalance) return "0";
    return format(accountBalance.amount, accountBalance.asset);
  });
  const isFromMaxActive = computed(() => {
    return fromAmount.value === formattedFromTokenBalance.value;
  });

  const {
    state,
    fromFieldAmount,
    toFieldAmount,
    priceMessage,
    priceImpact,
    providerFee,
    minimumReceived,
  } = useSwapCalculator({
    balances: computed(() => store.wallet.sif.balances),
    fromAmount,
    toAmount,
    fromSymbol,
    selectedField,
    toSymbol,
    slippage,
    poolFinder,
  });

  function clearAmounts() {
    fromAmount.value = "0.0";
    toAmount.value = "0.0";
  }

  function handleNextStepClicked() {
    if (!fromFieldAmount.value)
      throw new Error("from field amount is not defined");
    if (!toFieldAmount.value) throw new Error("to field amount is not defined");

    pageState.value = "confirm";
  }

  async function handleAskConfirmClicked() {
    if (!fromFieldAmount.value)
      throw new Error("from field amount is not defined");
    if (!toFieldAmount.value) throw new Error("to field amount is not defined");
    if (!minimumReceived.value)
      throw new Error("minimumReceived amount is not defined");

    pageState.value = "submit";

    txStatus.value = await usecases.clp.swap(
      fromFieldAmount.value,
      toFieldAmount.value.asset,
      minimumReceived.value,
    );

    pageState.value =
      typeof txStatus.value.code === "number" ? "fail" : "success";

    clearAmounts();
  }

  function swapInputs() {
    selectedField.value === "to"
      ? (selectedField.value = "from")
      : (selectedField.value = "to");
    const fromAmountValue = fromAmount.value;
    const fromSymbolValue = fromSymbol.value;
    fromAmount.value = toAmount.value;
    fromSymbol.value = toSymbol.value;
    toAmount.value = fromAmountValue;
    toSymbol.value = fromSymbolValue;
  }

  return {
    connected,
    nextStepMessage: computed(() => {
      switch (state.value) {
        case SwapState.SELECT_TOKENS:
          return "Select Tokens";
        case SwapState.ZERO_AMOUNTS:
          return "Please enter an amount";
        case SwapState.INSUFFICIENT_FUNDS:
          return "Insufficient Funds";
        case SwapState.INSUFFICIENT_LIQUIDITY:
          return "Insufficient Liquidity";
        case SwapState.INVALID_AMOUNT:
          return "Invalid Amount";
        case SwapState.VALID_INPUT:
          return "Swap";
      }
    }),
    disableInputFields: computed(() => {
      return state.value === SwapState.SELECT_TOKENS;
    }),
    handleFromSymbolClicked(next: () => void) {
      selectedField.value = "from";
      next();
    },
    handleToSymbolClicked(next: () => void) {
      selectedField.value = "to";
      next();
    },
    handleSelectClosed(data: string) {
      if (typeof data !== "string") {
        return;
      }

      if (selectedField.value === "from") {
        fromSymbol.value = data;
      }

      if (selectedField.value === "to") {
        toSymbol.value = data;
      }
      selectedField.value = null;
    },
    handleFromFocused() {
      selectedField.value = "from";
    },
    handleToFocused() {
      selectedField.value = "to";
    },
    handleNextStepClicked,
    handleBlur() {
      if (isFromMaxActive) return;
      selectedField.value = null;
    },
    slippage,
    fromAmount,
    toAmount,
    fromSymbol,
    fromTokenIconUrl,
    toTokenIconUrl,
    formattedFromTokenBalance,
    fromFieldAmount,
    toFieldAmount,
    minimumReceived: computed(() => {
      if (!minimumReceived.value) return "";
      const { amount, asset } = minimumReceived.value;
      return format(amount, asset, { mantissa: 18, trimMantissa: true });
    }),
    toSymbol,
    priceMessage,
    priceImpact,
    providerFee,
    handleFromMaxClicked() {
      selectedField.value = "from";
      const accountBalance = getAccountBalance();
      if (!accountBalance) return;
      const maxAmount = getMaxAmount(fromSymbol, accountBalance);
      fromAmount.value = format(maxAmount, accountBalance.asset, {
        mantissa: accountBalance.asset.decimals,
        trimMantissa: true,
      });
    },
    nextStepAllowed: computed(() => {
      return state.value === SwapState.VALID_INPUT;
    }),
    pageState,
    txStatus,
    transactionModalOpen: computed(() => pageState.value !== "idle"),
    requestTransactionModalClose,
    handleArrowClicked() {
      swapInputs();
    },
    handleConfirmClicked() {
      pageState.value = "submit";
    },
    handleAskConfirmClicked,

    isFromMaxActive,
    selectedField,
  };
};
