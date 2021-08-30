import { onMounted, ref, watch, watchEffect } from "vue";
import { useRouter } from "vue-router";
import { useWalletButton } from "@/componentsLegacy/WithWallet/useWalletButton";
import {
  Amount,
  IAsset,
  IAssetAmount,
  Pool,
  PoolState,
  TransactionStatus,
  usePoolCalculator,
} from "@sifchain/sdk";
import { useCore } from "@/hooks/useCore";
import { slipAdjustment } from "@sifchain/sdk/src/entities/formulae";
import { computed, Ref } from "@vue/reactivity";
import { useCurrencyFieldState } from "@/hooks/useCurrencyFieldState";
import { getMaxAmount } from "@/views/utils/getMaxAmount";
import {
  formatAssetAmount,
  formatNumber,
} from "@/componentsLegacy/shared/utils";
import { format } from "@sifchain/sdk";
import { useAssetBySymbol } from "@/hooks/useAssetBySymbol";
import { accountStore } from "@/store/modules/accounts";
import { debounce } from "@/views/utils/debounce";

export const useAddLiquidityData = () => {
  const { usecases, poolFinder, accountPoolFinder, store, config } = useCore();
  const selectedField = ref<"from" | "to" | null>(null);
  const lastFocusedTokenField = ref<"A" | "B" | null>(null);
  const aPerBRatioMessage: Ref<string> = ref("");
  const bPerARatioMessage: Ref<string> = ref("");
  const aPerBRatioProjectedMessage: Ref<string> = ref("");
  const bPerARatioProjectedMessage: Ref<string> = ref("");
  const totalLiquidityProviderUnits: Ref<string> = ref("");
  const totalPoolUnits: Ref<string> = ref("");
  const shareOfPoolPercent: Ref<string> = ref("");
  const state: Ref<PoolState> = ref(PoolState.SELECT_TOKENS);
  const tokenAFieldAmount: Ref<IAssetAmount | null> = ref(null);
  const tokenBFieldAmount: Ref<IAssetAmount | null> = ref(null);
  const preExistingPool: Ref<Pool | null> = ref(null);
  const poolAmounts: Ref<IAssetAmount[] | null> = ref(null);

  const modalStatus = ref<"setup" | "confirm" | "processing">("setup");
  const transactionStatus = ref<TransactionStatus | null>(null);

  const asyncPooling = ref<boolean>(true);
  const router = useRouter();

  const {
    fromSymbol: _fromSymbol,
    fromAmount,
    toAmount,
    toSymbol,
  } = useCurrencyFieldState({
    pooling: ref(true),
  });

  const fromSymbol = computed({
    get() {
      const sym =
        router.currentRoute.value?.params?.externalAsset?.toString() ||
        _fromSymbol.value ||
        "";
      const asset = config.assets.find(
        (a) => a.symbol.toUpperCase() === sym.toUpperCase(),
      );
      return asset?.symbol || _fromSymbol.value || "";
    },
    set(v: string) {
      _fromSymbol.value = v.toLowerCase();
      const asset = config.assets.find(
        (a) => a.symbol.toUpperCase() === v.toUpperCase(),
      );
      const symbol = asset?.symbol;
      if (!symbol) return;
      router.replace({
        ...router.currentRoute.value,
        params: {
          externalAsset: symbol,
        },
      });
    },
  });

  const isFromMaxActive = computed(() => {
    const accountBalance = balances.value.find(
      (balance) => balance.asset.symbol === fromSymbol.value,
    );
    if (!accountBalance) return;
    return (
      fromAmount.value === format(accountBalance.amount, accountBalance.asset)
    );
  });

  const fromAsset = useAssetBySymbol(fromSymbol);
  const toAsset = useAssetBySymbol(toSymbol);

  const isToMaxActive = computed(() => {
    const accountBalance = balances.value.find(
      (balance) => balance.asset.symbol === toSymbol.value,
    );
    if (!accountBalance) return;
    return (
      toAmount.value === format(accountBalance.amount, accountBalance.asset)
    );
  });

  function clearAmounts() {
    fromAmount.value = "0.0";
    toAmount.value = "0.0";
  }

  const { connected } = useWalletButton();

  const balances = accountStore.refs.sifchain.balances.computed();
  const liquidityProvider = computed(() => {
    return accountPoolFinder("rowan", fromSymbol.value)?.value?.lp || null;
  });

  const riskFactor = computed(() => {
    const rFactor = Amount("1");
    if (
      !tokenAFieldAmount.value ||
      !tokenBFieldAmount.value ||
      !poolAmounts.value
    ) {
      return rFactor;
    }
    const nativeBalance = poolAmounts?.value[0];
    const externalBalance = poolAmounts?.value[1];
    const slipAdjustmentCalc = slipAdjustment(
      tokenBFieldAmount.value,
      tokenAFieldAmount.value,
      nativeBalance,
      externalBalance,
      Amount(totalPoolUnits.value),
    );
    return rFactor.subtract(slipAdjustmentCalc);
  });

  function setTokenAAmount(amount: string) {
    fromAmount.value = amount;
  }

  function setTokenBAmount(amount: string) {
    toAmount.value = amount;
  }
  const hasActiveSafetyLag = ref(false);

  const updateDataWithOutput = ref(
    debounce((output) => {
      aPerBRatioMessage.value = output.aPerBRatioMessage;
      bPerARatioMessage.value = output.bPerARatioMessage;
      aPerBRatioProjectedMessage.value = output.aPerBRatioProjectedMessage;
      bPerARatioProjectedMessage.value = output.bPerARatioProjectedMessage;
      shareOfPoolPercent.value = output.shareOfPoolPercent;
      totalLiquidityProviderUnits.value = output.totalLiquidityProviderUnits;
      totalPoolUnits.value = output.totalPoolUnits;
      poolAmounts.value = output.poolAmounts;
      tokenAFieldAmount.value = output.tokenAFieldAmount;
      tokenBFieldAmount.value = output.tokenBFieldAmount;
      preExistingPool.value = output.preExistingPool;
      state.value = output.state;
      hasActiveSafetyLag.value = false;
    }, 5000),
  );
  watch(
    [
      balances,
      fromAmount,
      toAmount,
      fromSymbol,
      toSymbol,
      liquidityProvider,
      asyncPooling,
      lastFocusedTokenField,
      setTokenAAmount,
      setTokenBAmount,
    ],
    async () => {
      const output = usePoolCalculator({
        balances: balances.value,
        tokenAAmount: fromAmount.value,
        tokenBAmount: toAmount.value,
        tokenASymbol: fromSymbol.value,
        tokenBSymbol: toSymbol.value,
        poolFinder: (a: string | IAsset, b: string | IAsset) =>
          poolFinder(a, b)?.value || null,
        liquidityProvider: liquidityProvider.value,
        guidedMode: asyncPooling.value,
        lastFocusedTokenField: lastFocusedTokenField.value,
        setTokenAAmount,
        setTokenBAmount,
      });
      hasActiveSafetyLag.value = true;
      updateDataWithOutput.value(output);
    },
  );

  function handleNextStepClicked() {
    if (!tokenAFieldAmount.value)
      throw new Error("from field amount is not defined");
    if (!tokenBFieldAmount.value)
      throw new Error("to field amount is not defined");

    modalStatus.value = "confirm";
  }

  async function handleAskConfirmClicked() {
    if (!tokenAFieldAmount.value)
      throw new Error("Token A field amount is not defined");
    if (!tokenBFieldAmount.value)
      throw new Error("Token B field amount is not defined");

    modalStatus.value = "processing";
    transactionStatus.value = {
      state: "requested",
      hash: "",
    };
    transactionStatus.value = await usecases.clp.addLiquidity(
      tokenBFieldAmount.value,
      tokenAFieldAmount.value,
    );
    setTimeout(() => usecases.clp.syncPools(), 2500);
  }

  function requestTransactionModalClose() {
    router.push("/pool");
    clearAmounts();
  }

  function toggleAsyncPooling() {
    asyncPooling.value = !asyncPooling.value;
  }

  return {
    state,
    toAsset,
    fromAsset,
    fromAmount,
    fromSymbol,
    toAmount,
    toSymbol,
    isToMaxActive,
    isFromMaxActive,
    connected,
    aPerBRatioMessage,
    bPerARatioMessage,
    aPerBRatioProjectedMessage,
    bPerARatioProjectedMessage,
    hasActiveSafetyLag,
    nextStepMessage: computed(() => {
      switch (state.value) {
        case PoolState.SELECT_TOKENS:
          return "Select Tokens";
        case PoolState.ZERO_AMOUNTS:
          return "Please enter an amount";
        case PoolState.ZERO_AMOUNTS_NEW_POOL:
          return "Both inputs required";
        case PoolState.INSUFFICIENT_FUNDS:
          return "Insufficient Funds";
        case PoolState.VALID_INPUT:
          return preExistingPool.value ? "Add liquidity" : "Create Pool";
      }
    }),
    toggleLabel: computed(() => {
      return !preExistingPool.value ? null : "Pool Equally";
    }),
    nextStepAllowed: computed(() => {
      return state.value === PoolState.VALID_INPUT;
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

    // TODO - The other selectedField variable does a few things
    // And trying to remove the idea of to/from so slightly reinventing here
    handleTokenAFocused() {
      selectedField.value = "from";
      lastFocusedTokenField.value = "A";
    },
    handleTokenBFocused() {
      selectedField.value = "to";
      lastFocusedTokenField.value = "B";
    },
    backlink: window.history.state.back || "/pool",

    handleNextStepClicked,

    handleAskConfirmClicked,

    transactionStatus,
    modalStatus,

    requestTransactionModalClose,
    tokenAFieldAmount,
    tokenBFieldAmount,
    toggleAsyncPooling,
    asyncPooling,
    handleBlur() {
      selectedField.value = null;
    },
    handleFromMaxClicked() {
      selectedField.value = "from";
      lastFocusedTokenField.value = "A";
      const accountBalance = balances.value.find(
        (balance) => balance.asset.symbol === fromSymbol.value,
      );

      if (!accountBalance) return;
      fromAmount.value = formatAssetAmount(accountBalance);
    },
    handleToMaxClicked() {
      selectedField.value = "to";
      lastFocusedTokenField.value = "B";
      const accountBalance = balances.value.find(
        (balance) => balance.asset.symbol === toSymbol.value,
      );
      if (!accountBalance) return;
      const maxAmount = getMaxAmount(toSymbol, accountBalance);
      toAmount.value = format(maxAmount, accountBalance.asset, {
        mantissa: 18,
      });
    },
    shareOfPoolPercent,
    formatNumber,
    poolUnits: totalLiquidityProviderUnits,
    riskFactorStatus: computed<"" | "bad" | "danger" | "warning">(() => {
      if (!riskFactor.value || asyncPooling.value) return "";
      if (riskFactor.value.lessThanOrEqual("0.01")) {
        return "";
      } else if (riskFactor.value.lessThanOrEqual("0.1")) {
        return "warning";
      } else if (riskFactor.value.lessThanOrEqual("0.2")) {
        return "bad";
      } else {
        return "danger";
      }
    }),
  };
};
