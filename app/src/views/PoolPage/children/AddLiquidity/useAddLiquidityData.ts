import {
  Amount,
  format,
  Network,
  Pool,
  TransactionStatus,
} from "@sifchain/sdk";
import { slipAdjustment } from "@sifchain/sdk/src/entities/formulae";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";

import { useQueryClient } from "vue-query";
import { PoolState, useReactivePoolCalculator } from "~/business/calculators";
import { formatAssetAmount, formatNumber } from "~/components/utils";
import {
  LIQUIDITY_PROVIDERS_KEY,
  LIQUIDITY_PROVIDER_KEY,
} from "~/domains/clp/queries/liquidityProvider";
import { useAssetBySymbol } from "~/hooks/useAssetBySymbol";
import { useCore } from "~/hooks/useCore";
import { useCurrencyFieldState } from "~/hooks/useCurrencyFieldState";
import { useWalletButton } from "~/hooks/useWalletButton";
import { accountStore } from "~/store/modules/accounts";
import { getMaxAmount } from "~/views/utils/getMaxAmount";

export const useAddLiquidityData = () => {
  const queryClient = useQueryClient();
  const { usecases, poolFinder, accountPoolFinder, config } = useCore();
  const selectedField = ref<"from" | "to" | null>(null);
  const lastFocusedTokenField = ref<"A" | "B" | null>(null);

  const modalStatus = ref<"setup" | "confirm" | "processing">("setup");
  const transactionStatus = ref<TransactionStatus | null>(null);

  const symmetricalPooling = ref<boolean>(true);
  const router = useRouter();

  const {
    fromSymbol: _fromSymbol,
    fromAmount,
    toAmount,
    toSymbol,
  } = useCurrencyFieldState({ pooling: ref(true) });

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
      if (!symbol) {
        return;
      }
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
    if (!accountBalance) {
      return;
    }
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
    if (!accountBalance) {
      return;
    }
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
      !(
        tokenAField.value.fieldAmount &&
        tokenBField.value.fieldAmount &&
        poolAmounts.value
      )
    ) {
      return rFactor;
    }
    const nativeBalance = poolAmounts?.value[0];
    const externalBalance = poolAmounts?.value[1];
    const slipAdjustmentCalc = slipAdjustment(
      tokenBField.value.fieldAmount,
      tokenAField.value.fieldAmount,
      nativeBalance,
      externalBalance,
    );
    return rFactor.subtract(slipAdjustmentCalc);
  });

  const hasActiveSafetyLag = ref(false);

  // WARNING: DO NOT MIGRATE TO NON-REACTIVE UTILITY WITHIN `useEffect`
  // THIS CREATES A RECURSIVE OBSERVER LOOP AND DETRIMENTALLY BREAKS LIQUIDITY
  // ADDS
  const {
    aPerBRatioMessage,
    bPerARatioMessage,
    aPerBRatioProjectedMessage,
    bPerARatioProjectedMessage,
    shareOfPoolPercent,
    totalLiquidityProviderUnits,
    poolAmounts,
    tokenAField,
    tokenBField,
    preExistingPool,
    state,
  } = useReactivePoolCalculator({
    balances,
    tokenAAmount: fromAmount,
    tokenBAmount: toAmount,
    tokenASymbol: fromSymbol,
    tokenBSymbol: toSymbol,
    poolFinder,
    liquidityProvider,
    symmetricalPooling,
    lastFocusedTokenField,
  });

  function handleNextStepClicked() {
    if (!tokenAField.value.fieldAmount) {
      throw new Error("from field amount is not defined");
    }
    if (!tokenBField.value.fieldAmount) {
      throw new Error("to field amount is not defined");
    }

    modalStatus.value = "confirm";
  }

  async function handleAskConfirmClicked() {
    if (!tokenAField.value.fieldAmount) {
      throw new Error("Token A field amount is not defined");
    }

    if (!tokenBField.value.fieldAmount) {
      throw new Error("Token B field amount is not defined");
    }

    modalStatus.value = "processing";
    transactionStatus.value = {
      state: "requested",
      hash: "",
    };

    if (tokenAField.value.asset?.symbol === "rowan") {
      // invert fields when token a is rowan

      transactionStatus.value = await usecases.clp.addLiquidity(
        tokenAField.value.fieldAmount,
        tokenBField.value.fieldAmount,
      );
    } else {
      transactionStatus.value = await usecases.clp.addLiquidity(
        tokenBField.value.fieldAmount,
        tokenAField.value.fieldAmount,
      );
    }

    await Promise.all([
      queryClient.invalidateQueries(LIQUIDITY_PROVIDER_KEY),
      queryClient.invalidateQueries(LIQUIDITY_PROVIDERS_KEY),
    ]);

    if (!(tokenAField.value.fieldAmount && tokenBField.value.fieldAmount)) {
      throw new Error("Token A or Token B field amount is not defined");
    }

    const pool = new Pool(
      tokenAField.value.fieldAmount,
      tokenBField.value.fieldAmount,
    );

    if (transactionStatus.value.state === "accepted") {
      useCore().services.bus.dispatch({
        type: "SuccessEvent",
        payload: {
          message: `Added ${[
            tokenAField.value.fieldAmount.greaterThan("0") &&
              `${formatAssetAmount(
                tokenAField.value.fieldAmount,
              )} ${tokenAField.value.fieldAmount?.displaySymbol.toUpperCase()}`,
            tokenBField.value.fieldAmount.greaterThan("0") &&
              `${formatAssetAmount(
                tokenBField.value.fieldAmount,
              )} ${tokenBField.value.fieldAmount?.displaySymbol.toUpperCase()}`,
          ]
            .filter(Boolean)
            .join(
              " and ",
            )} to ${pool.nativeAmount?.displaySymbol.toUpperCase()} / ${pool.externalAmount?.displaySymbol.toUpperCase()} pool`,
        },
      });
    }
    setTimeout(() => {
      usecases.clp.syncPools.syncUserPools(accountStore.state.sifchain.address);
      usecases.clp.syncPools.syncPublicPools();
      accountStore.updateBalances(Network.SIFCHAIN);
    }, 1000);
  }

  function requestTransactionModalClose() {
    router.push("/pool");
    clearAmounts();
  }

  function toggleSymmetricPooling() {
    symmetricalPooling.value = !symmetricalPooling.value;
  }

  return {
    state,
    toAsset,
    fromAsset,
    fromAmount,
    fromSymbol,
    toAmount,
    toSymbol,
    tokenAField,
    tokenBField,
    isToMaxActive,
    isFromMaxActive,
    connected,
    aPerBRatioMessage,
    bPerARatioMessage,
    aPerBRatioProjectedMessage,
    bPerARatioProjectedMessage,
    hasActiveSafetyLag,
    nextStepMessage: computed(() => {
      if (!accountStore.state.sifchain.connected) {
        return "Connect Sifchain Wallet";
      }

      switch (state.value) {
        case PoolState.SELECT_TOKENS:
          return "Select Tokens";
        case PoolState.ZERO_AMOUNTS: {
          return symmetricalPooling.value
            ? "Please enter both amounts"
            : "Please enter an amount";
        }
        case PoolState.ZERO_AMOUNTS_NEW_POOL:
          return "Both inputs required";
        case PoolState.INSUFFICIENT_FUNDS:
          return "Insufficient Funds";
        case PoolState.INSUFFICIENT_FUNDS_FROM:
          return `Insufficient ${fromAsset.value?.displaySymbol.toUpperCase()} Balance`;
        case PoolState.INSUFFICIENT_FUNDS_TO:
          return `Insufficient ${toAsset.value?.displaySymbol.toUpperCase()} Balance`;
        case PoolState.VALID_INPUT:
          return preExistingPool.value ? "Add liquidity" : "Create Pool";
        default:
          return "";
      }
    }),
    toggleLabel: computed(() => {
      return preExistingPool.value ? "Pool Equally" : null;
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
    symmetricalPooling,

    requestTransactionModalClose,
    toggleSymmetricPooling,
    handleBlur() {
      selectedField.value = null;
    },
    handleFromMaxClicked() {
      selectedField.value = "from";
      lastFocusedTokenField.value = "A";
      const accountBalance = balances.value.find(
        (balance) => balance.asset.symbol === fromSymbol.value,
      );

      if (!accountBalance) {
        return;
      }
      fromAmount.value = formatAssetAmount(accountBalance);
    },
    handleToMaxClicked() {
      selectedField.value = "to";
      lastFocusedTokenField.value = "B";
      const accountBalance = balances.value.find(
        (balance) => balance.asset.symbol === toSymbol.value,
      );
      if (!accountBalance) {
        return;
      }
      const maxAmount = getMaxAmount(toSymbol, accountBalance);
      toAmount.value = format(maxAmount, accountBalance.asset, {
        mantissa: 18,
      });
    },
    shareOfPoolPercent,
    formatNumber,
    poolUnits: totalLiquidityProviderUnits,
    riskFactorStatus: computed<"" | "bad" | "danger" | "warning">(() => {
      if (!riskFactor.value || symmetricalPooling.value) {
        return "";
      }
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
