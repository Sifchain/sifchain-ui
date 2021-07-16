import { computed, effect, reactive, ref } from "@vue/reactivity";
import { useCore } from "@/hooks/useCore";
import {
  IAsset,
  SwapState,
  TransactionStatus,
  useSwapCalculator,
} from "@sifchain/sdk";
import { useWalletButton } from "@/componentsLegacy/WithWallet/useWalletButton";
import { getMaxAmount } from "../utils/getMaxAmount";
import { format } from "@sifchain/sdk/src/utils/format";
import { useTokenIconUrl } from "@/hooks/useTokenIconUrl";
import { useFormattedTokenBalance } from "@/hooks/useFormattedTokenBalance";
import { useRouter } from "vue-router";
export type SwapPageState = "idle" | "confirm" | "submit" | "fail" | "success";

export const useSwapPageData = () => {
  const { usecases, poolFinder, store } = useCore();
  const router = useRouter();
  const fromSymbol = ref("rowan");
  const toSymbol = ref("cband");
  const fromAmount = ref("1");
  const toAmount = ref("0");

  const slippage = ref<string>("1.0");
  const pageState = computed<SwapPageState>(() => {
    return router.currentRoute.value.meta.pageState as SwapPageState;
  });
  const txStatus = ref<TransactionStatus | null>(null);

  const selectedField = ref<"from" | "to" | null>("from");
  const core = useCore();
  const getAccountBalance = () => {
    return store.wallet.sif.balances.find(
      (balance) => balance.asset.symbol === fromSymbol.value,
    );
  };
  const fromAsset = computed(() => {
    return (
      core.config.assets.find(
        (asset) =>
          asset.symbol == fromSymbol.value ||
          asset.symbol == `c${fromSymbol.value}`,
      ) || (core.config.assets[0] as IAsset)
    );
  });
  const toAsset = computed(() => {
    return (
      core.config.assets.find(
        (asset) =>
          asset.symbol == toSymbol.value ||
          asset.symbol == `c${toSymbol.value}`,
      ) || (core.config.assets[0] as IAsset)
    );
  });

  const fromTokenIconUrl = useTokenIconUrl({
    symbol: fromSymbol,
  });
  const toTokenIconUrl = useTokenIconUrl({
    symbol: toSymbol,
  });

  const { connected } = useWalletButton();

  function requestTransactionModalClose() {
    router.push({
      name: "Swap",
    });
  }

  const formattedFromTokenBalance = useFormattedTokenBalance(fromSymbol);
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
    router.push({
      name: "ConfirmSwap",
    });
  }

  async function handleAskConfirmClicked() {
    if (!fromFieldAmount.value)
      throw new Error("from field amount is not defined");
    if (!toFieldAmount.value) throw new Error("to field amount is not defined");
    if (!minimumReceived.value)
      throw new Error("minimumReceived amount is not defined");

    router.push({
      name: "ApproveSwap",
    });
    debugger;
    txStatus.value = await usecases.clp.swap(
      fromFieldAmount.value,
      toFieldAmount.value.asset,
      minimumReceived.value,
    );

    if (typeof txStatus.value.code === "number") {
      alert("swap failed");
      router.push({
        name: "Swap",
      });
    } else {
      router.push({
        name: "SubmittedSwap",
      });
    }
    // clearAmounts();
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
    fromAsset,
    toAsset,
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
      router.push({ name: "" });
    },
    handleAskConfirmClicked,

    isFromMaxActive,
    selectedField,
  };
};
