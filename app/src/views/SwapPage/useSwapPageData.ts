import {
  Amount,
  DEFAULT_FEE,
  format,
  IAsset,
  NativeDexClient,
  Network,
  SifchainEncodeObject,
  toBaseUnits,
  TransactionStatus,
} from "@sifchain/sdk";
import { computed, ref, watch, watchEffect } from "vue";
import { useRoute, useRouter } from "vue-router";

import { ServiceContext } from "~/business";
import {
  SwapState,
  useSwapCalculator,
} from "~/business/calculators/swapCalculatorPMTP";
import { useSifchainClients } from "~/business/providers/SifchainClientsProvider";
import { formatAssetAmount } from "~/components/utils";
import { useBoundRoute } from "~/hooks/useBoundRoute";
import { useChains, useNativeChain } from "~/hooks/useChains";
import { useCore } from "~/hooks/useCore";
import { useFormattedTokenBalance } from "~/hooks/useFormattedTokenBalance";
import { useTokenIconUrl } from "~/hooks/useTokenIconUrl";
import { useWalletButton } from "~/hooks/useWalletButton";
import { accountStore } from "~/store/modules/accounts";
import { getMaxAmount } from "../utils/getMaxAmount";

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
    // nothing to do here
  }
}

const currentSwapInput = {
  fromSymbol: defaultSymbol,
  toSymbol: "rowan",
  slippage: "1.0",
  toAmount: "0",
  fromAmount: "0",
};

function getRouteSymbol(
  config: ServiceContext,
  queryValue: string,
  defaultValue: string,
) {
  const asset = config.assets.find((asset) => {
    return (
      asset.symbol.toLowerCase() === queryValue.toLowerCase() &&
      asset.network === Network.SIFCHAIN
    );
  });
  return asset?.symbol || defaultValue;
}

export const useSwapPageData = () => {
  const { poolFinder, store, config } = useCore();
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

  const pageState = computed<SwapPageState>(
    () => router.currentRoute.value.meta.pageState as SwapPageState,
  );
  const txStatus = ref<TransactionStatus | null>(null);

  const selectedField = ref<"from" | "to" | null>("from");
  const core = useCore();
  const getAccountBalance = () => {
    return store.wallet
      .get(Network.SIFCHAIN)
      .balances.find((balance) => balance.asset.symbol === fromSymbol.value);
  };
  const fromAsset = computed(() => {
    const found = core.config.assets.find(
      (asset) =>
        asset.symbol === fromSymbol.value ||
        asset.symbol === `c${fromSymbol.value}`,
    );
    return found ?? (core.config.assets[0] as IAsset);
  });

  const toAsset = computed(() => {
    const found = core.config.assets.find(
      (asset) =>
        asset.symbol === toSymbol.value ||
        asset.symbol === `c${toSymbol.value}`,
    );

    return found ?? (core.config.assets[0] as IAsset);
  });

  const fromTokenIconUrl = useTokenIconUrl({ symbol: fromSymbol });
  const toTokenIconUrl = useTokenIconUrl({ symbol: toSymbol });

  const { connected } = useWalletButton();

  function requestTransactionModalClose() {
    router.replace({
      name: "Swap",
    });
  }

  const formattedFromTokenBalance = useFormattedTokenBalance(fromSymbol);
  const isFromMaxActive = computed(
    () => fromAmount.value === formattedFromTokenBalance.value,
  );

  const formattedToTokenBalance = useFormattedTokenBalance(toSymbol);

  const {
    state,
    fromFieldAmount,
    toFieldAmount,
    priceRatio,
    priceImpact,
    providerFee,
    minimumReceived,
    effectiveMinimumReceived,
    currentAssetLiquidityThreshold,
    swapFeeRate,
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

  function handleNextStepClicked() {
    if (!fromFieldAmount) {
      throw new Error("from field amount is not defined");
    }
    if (!toFieldAmount) {
      throw new Error("to field amount is not defined");
    }

    router.replace({
      name: "ConfirmSwap",
    });
  }

  function checkSwapInputs() {
    if (!fromFieldAmount) {
      throw new Error("from field amount is not defined");
    }
    if (!toFieldAmount) {
      throw new Error("to field amount is not defined");
    }
    if (!minimumReceived.value) {
      throw new Error("minimumReceived amount is not defined");
    }
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
    if (fromFieldAmount && toFieldAmount && minimumReceived.value) {
      txStatus.value = {
        state: "requested",
        hash: "",
      };

      try {
        const sifchainClients = useSifchainClients();
        const { liquidity } = useCore().services;

        const tx = await liquidity.swap.prepareSwapTx({
          address: accountStore.state.sifchain.address,
          fromAmount: fromFieldAmount,
          toAsset: toFieldAmount.asset,
          minimumReceived: minimumReceived.value,
        });

        const stargateClient = await sifchainClients.getOrInitSigningClient();

        const res = await stargateClient.signAndBroadcast(
          tx.fromAddress,
          tx.msgs as SifchainEncodeObject[],
          DEFAULT_FEE,
        );

        txStatus.value = NativeDexClient.parseTxResult(res as any);
      } catch (error) {
        const errorMessage =
          typeof error === "string" ? error : (error as Error).message;

        txStatus.value = {
          state: "failed",
          hash: "",
          memo: errorMessage,
        };
      }
      if (txStatus.value.state === "accepted") {
        useCore().services.bus.dispatch({
          type: "SuccessEvent",
          payload: {
            message: `Swapped ${formatAssetAmount(
              fromFieldAmount,
            )} ${fromFieldAmount.displaySymbol.toUpperCase()} for ${formatAssetAmount(
              toFieldAmount,
            )} ${toFieldAmount.displaySymbol.toUpperCase()}`,
          },
        });
        setTimeout(() => {
          accountStore.updateBalances(Network.SIFCHAIN);
        }, 1000);
      }
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

  const swapValidityMessage = (isValid: boolean, message: string) => ({
    isValid,
    message,
  });

  const formattedCurrentLiquidityThreshold = computed(() =>
    currentAssetLiquidityThreshold.value
      .toDerived()
      .toNumber()
      .toLocaleString("en", {
        notation: "compact",
      }),
  );

  const nextStepValidityMessage = computed(() => {
    if (!accountStore.state.sifchain.address) {
      return swapValidityMessage(false, "Connect Sifchain Wallet");
    }
    if (fromAsset.value?.symbol.toLowerCase() === "rowan") {
      const nativeBalance = accountStore.state.sifchain.balances.find(
        (b) => b.asset.symbol.toLowerCase() === "rowan",
      );
      if (
        nativeBalance?.amount
          .subtract(fromFieldAmount || "0")
          .lessThan(SWAP_MIN_BALANCE)
      ) {
        return swapValidityMessage(
          false,
          `Insufficient ${fromAsset.value.displaySymbol.toUpperCase()} Balance`,
        );
      }
    }

    switch (state.value) {
      case SwapState.ZERO_AMOUNTS:
        return swapValidityMessage(false, "Please enter an amount");
      case SwapState.INSUFFICIENT_FUNDS:
        return swapValidityMessage(
          false,
          `Insufficient ${fromAsset.value.displaySymbol.toUpperCase()} Balance`,
        );
      case SwapState.INSUFFICIENT_LIQUIDITY:
        return swapValidityMessage(false, "Insufficient Liquidity");
      case SwapState.EXCEEDS_CURRENT_LIQUIDITY_THRESHOLD:
        return swapValidityMessage(false, "Swap");
      case SwapState.INVALID_AMOUNT:
        return swapValidityMessage(false, "Invalid Amount");
      case SwapState.VALID_INPUT:
        return swapValidityMessage(true, "Swap");
      case SwapState.FRONTRUN_SLIPPAGE:
        return swapValidityMessage(
          true,
          "Swap (Frontrun attack possible due to high slippage)",
        );
      case SwapState.INVALID_SLIPPAGE:
        return swapValidityMessage(false, "Invalid slippage");

      default:
        return swapValidityMessage(false, "Unknown");
    }
  });

  const formattedMinimumReceived = computed(() => {
    if (!minimumReceived.value) {
      return "";
    }
    const { amount, asset } = minimumReceived.value;
    return amount.greaterThanOrEqual(Amount("0"))
      ? format(amount, asset, { mantissa: 6, trimMantissa: true })
      : "Price impact too high";
  });

  const formattedEffectiveToAmount = computed(() => {
    if (!effectiveMinimumReceived.value) {
      return "";
    }
    const { amount, asset } = effectiveMinimumReceived.value;
    return amount.greaterThanOrEqual(Amount("0"))
      ? format(amount, asset, { mantissa: 6, trimMantissa: true })
      : "Price impact too high";
  });

  return {
    connected,
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
      if (isFromMaxActive.value) {
        return;
      }
      selectedField.value = null;
    },
    slippage,
    fromAsset,
    toAsset,
    fromAmount,
    toAmount,
    effectiveToAmount: formattedEffectiveToAmount,
    effectiveMinimumReceived,
    fromSymbol,
    fromTokenIconUrl,
    toTokenIconUrl,
    formattedFromTokenBalance,
    formattedToTokenBalance,
    fromFieldAmount,
    toFieldAmount,
    minimumReceived: formattedMinimumReceived,
    toSymbol,
    priceRatio,
    priceImpact,
    providerFee,
    formattedCurrentLiquidityThreshold,
    handleFromMaxClicked() {
      selectedField.value = "from";
      const accountBalance = getAccountBalance();
      if (!accountBalance) {
        return;
      }
      const maxAmount = getMaxAmount(fromSymbol, accountBalance);
      fromAmount.value = format(maxAmount, accountBalance.asset, {
        mantissa: accountBalance.asset.decimals,
        trimMantissa: true,
      });
    },
    nextStepAllowed: computed(() => {
      // return whether swap is valid
      return nextStepValidityMessage.value.isValid;
    }),
    nextStepMessage: computed(() => {
      // return message stating whether they can proceed or need to update invalid inputs
      return nextStepValidityMessage.value.message;
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
    swapFeeRate,
  };
};
