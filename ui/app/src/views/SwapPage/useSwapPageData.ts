import { onMounted, watch, watchEffect } from "vue";
import { computed, effect, reactive, ref } from "@vue/reactivity";
import { useCore } from "@/hooks/useCore";
import {
  IAsset,
  Network,
  SwapState,
  TransactionStatus,
  useSwapCalculator,
  ServiceContext,
  Asset,
  toBaseUnits,
} from "@sifchain/sdk";
import { useWalletButton } from "@/componentsLegacy/WithWallet/useWalletButton";
import { getMaxAmount } from "../utils/getMaxAmount";
import { format } from "@sifchain/sdk/src/utils/format";
import { useTokenIconUrl } from "@/hooks/useTokenIconUrl";
import { useFormattedTokenBalance } from "@/hooks/useFormattedTokenBalance";
import { useRoute, useRouter } from "vue-router";
import { useBoundRoute } from "@/hooks/useBoundRoute";
import { accountStore } from "@/store/modules/accounts";
import { useChains, useNativeChain } from "@/hooks/useChains";
import { formatAssetAmount } from "@/componentsLegacy/shared/utils";
export type SwapPageState = "idle" | "confirm" | "submit" | "fail" | "success";

export const SWAP_MIN_BALANCE = toBaseUnits(
  "0.25",
  useNativeChain().nativeAsset,
);

let defaultSymbol = "";
const options = ["uatom", "uphoton", "uiris", "ceth"];
while (defaultSymbol === "") {
  const option = options.shift() || "";
  try {
    useChains().get(Network.SIFCHAIN).lookupAssetOrThrow(option);
    defaultSymbol = option;
    break;
  } catch (e) {
    null;
  }
}

const currentSwapInput = {
  fromSymbol: defaultSymbol,
  toSymbol: "rowan",
  slippage: "1.0",
  toAmount: "0",
  fromAmount: "0",
};

const getRouteSymbol = (
  config: ServiceContext,
  queryValue: string,
  defaultValue: string,
) => {
  const asset = config.assets.find((asset) => {
    return (
      asset.symbol.toLowerCase() === queryValue.toLowerCase() &&
      asset.network === Network.SIFCHAIN
    );
  });
  return asset?.symbol || defaultValue;
};

export const useSwapPageData = () => {
  const { usecases, poolFinder, store, config } = useCore();
  const router = useRouter();
  const route = useRoute();

  const fromSymbol = ref(
    getRouteSymbol(
      config,
      String(route.query.fromSymbol || ""),
      currentSwapInput.fromSymbol,
    ),
  );
  const toSymbol = ref(
    getRouteSymbol(
      config,
      String(route.query.toSymbol || ""),
      currentSwapInput.toSymbol,
    ),
  );

  const toAmount = ref(currentSwapInput.toAmount);
  const fromAmount = ref(currentSwapInput.fromAmount);
  const slippage = ref<string>(currentSwapInput.slippage || "1.0");

  watch([fromAmount, toAmount], () => {
    currentSwapInput.fromAmount = fromAmount.value;
    currentSwapInput.toAmount = toAmount.value;
  });
  useBoundRoute({
    query: {
      from: fromSymbol,
      to: toSymbol,
      slippage: slippage,
    },
    params: {},
  });

  if (fromSymbol.value === toSymbol.value) {
    toSymbol.value = fromSymbol.value === "rowan" ? defaultSymbol : "rowan";
  }

  watchEffect(() => {
    Object.assign(currentSwapInput, {
      fromSymbol: fromSymbol.value,
      toSymbol: toSymbol.value,
      fromAmount: fromAmount.value,
      toAmount: toAmount.value,
      slippage: slippage.value,
    });
  });

  const pageState = computed<SwapPageState>(() => {
    return router.currentRoute.value.meta.pageState as SwapPageState;
  });
  const txStatus = ref<TransactionStatus | null>(null);

  const selectedField = ref<"from" | "to" | null>("from");
  const core = useCore();
  const getAccountBalance = () => {
    return store.wallet
      .get(Network.SIFCHAIN)
      .balances.find((balance) => balance.asset.symbol === fromSymbol.value);
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
    router.replace({
      name: "Swap",
    });
  }

  const formattedFromTokenBalance = useFormattedTokenBalance(fromSymbol);
  const isFromMaxActive = computed(() => {
    return fromAmount.value === formattedFromTokenBalance.value;
  });

  const formattedToTokenBalance = useFormattedTokenBalance(toSymbol);

  const {
    state,
    fromFieldAmount,
    toFieldAmount,
    priceRatio,
    priceMessage,
    priceImpact,
    providerFee,
    minimumReceived,
  } = useSwapCalculator({
    balances: computed(() => store.wallet.get(Network.SIFCHAIN).balances),
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
    router.replace({
      name: "ConfirmSwap",
    });
  }

  function checkSwapInputs() {
    if (!fromFieldAmount.value)
      throw new Error("from field amount is not defined");
    if (!toFieldAmount.value) throw new Error("to field amount is not defined");
    if (!minimumReceived.value)
      throw new Error("minimumReceived amount is not defined");
  }
  async function handleAskConfirmClicked() {
    checkSwapInputs();
    router.replace({
      name: "ApproveSwap",
    });
  }

  async function handleBeginSwap() {
    checkSwapInputs();

    // This condition is just to make typescript happy:
    if (fromFieldAmount.value && toFieldAmount.value && minimumReceived.value) {
      txStatus.value = {
        state: "requested",
        hash: "",
      };

      txStatus.value = await usecases.clp.swap(
        fromFieldAmount.value,
        toFieldAmount.value.asset,
        minimumReceived.value,
      );
      if (txStatus.value.state === "accepted") {
        useCore().services.bus.dispatch({
          type: "SuccessEvent",
          payload: {
            message: `Swapped ${formatAssetAmount(
              fromFieldAmount.value,
            )} ${fromFieldAmount.value.displaySymbol.toUpperCase()} for ${formatAssetAmount(
              toFieldAmount.value,
            )} ${toFieldAmount.value.displaySymbol.toUpperCase()}`,
          },
        });
      }
      setTimeout(() => {
        accountStore.updateBalances(Network.SIFCHAIN);
      }, 1000);
    }
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

  const nextStepMessage = computed(() => {
    if (!accountStore.state.sifchain.address) {
      return "Connect Sifchain Wallet";
    }
    if (fromAsset.value?.symbol.toLowerCase() === "rowan") {
      const nativeBalance = accountStore.state.sifchain.balances.find(
        (b) => b.asset.symbol.toLowerCase() === "rowan",
      );
      if (
        nativeBalance?.amount
          .subtract(fromFieldAmount.value || "0")
          .lessThan(SWAP_MIN_BALANCE)
      ) {
        return `Insufficient ${fromAsset.value.displaySymbol.toUpperCase()} Balance`;
      }
    }
    switch (state.value) {
      case SwapState.ZERO_AMOUNTS:
        return "Please enter an amount";
      case SwapState.INSUFFICIENT_FUNDS:
        return `Insufficient ${fromAsset.value.displaySymbol.toUpperCase()} Balance`;
      case SwapState.INSUFFICIENT_LIQUIDITY:
        return "Insufficient Liquidity";
      case SwapState.INVALID_AMOUNT:
        return "Invalid Amount";
      case SwapState.VALID_INPUT:
        return "Swap";
    }
  });

  return {
    connected,
    nextStepMessage,
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
    formattedToTokenBalance,
    fromFieldAmount,
    toFieldAmount,
    minimumReceived: computed(() => {
      if (!minimumReceived.value) return "";
      const { amount, asset } = minimumReceived.value;
      return format(amount, asset, { mantissa: 18, trimMantissa: true });
    }),
    toSymbol,
    priceMessage,
    priceRatio,
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
      return nextStepMessage.value === "Swap";
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
    handleBeginSwap,

    isFromMaxActive,
    selectedField,
  };
};
