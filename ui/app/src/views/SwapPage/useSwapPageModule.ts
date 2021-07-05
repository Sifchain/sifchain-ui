import { computed, effect, reactive, ref } from "@vue/reactivity";
import { useCore } from "@/hooks/useCore";
import {
  IAsset,
  SwapState,
  TransactionStatus,
  useSwapCalculator,
} from "@sifchain/sdk";
import { useWalletButton } from "@/components/WithWallet/useWalletButton";
import { useCurrencyFieldState } from "@/hooks/useCurrencyFieldState";
import { getMaxAmount } from "../utils/getMaxAmount";
import { format } from "@sifchain/sdk/src/utils/format";
import { nextTick, onMounted, watch, watchEffect } from "vue";
import { formatAssetAmount } from "@/components/shared/utils";

export type TokenInputGroupModuleState = {
  symbol: string;
  amount: string;
  type: "from" | "to";
};
export const useTokenInputGroupModule = (
  initialState: TokenInputGroupModuleState,
) => {
  const core = useCore();
  const state = reactive(initialState);

  const asset = computed(() => {
    const asset = core.config.assets.find(
      (a) => a.symbol === state.symbol,
    ) as IAsset;
    return asset;
  });
  const balance = computed(() => {
    const assetAmount = core.store.wallet.sif.balances.find((val) => {
      return val.asset.symbol == state.symbol;
    });
    return assetAmount;
  });
  const formattedBalance = computed(() => {
    if (!balance.value) return 0;
    const out = formatAssetAmount(balance.value);
    return out;
  });
  const mutations = {
    updateAsset(symbol: string) {
      state.symbol = symbol;
    },
    updateAmount(amount: string) {
      state.amount = amount;
    },
    setAmountToMax() {
      const accountBalance = balance.value;
      if (!accountBalance) return;
      const maxAmount = getMaxAmount(ref(state.symbol), accountBalance);
      const val = format(maxAmount, accountBalance.asset, {
        mantissa: accountBalance.asset.decimals,
        trimMantissa: true,
      });
      mutations.updateAmount(val);
    },
  };

  return {
    state,
    computed: {
      asset,
      formattedBalance,
    },
    mutations,
  };
};
export const useSwapPageModule = () => {
  const modules = {
    fromTokenInputGroup: useTokenInputGroupModule({
      symbol: "cdai",
      amount: "1",
      type: "from",
    }),
    toTokenInputGroup: useTokenInputGroupModule({
      symbol: "rowan",
      amount: "0",
      type: "to",
    }),
  };
  const state = reactive({
    slippage: "1.0",
    slippageOptions: ["0.5", "1.0", "1.5"],
    activeFieldType: "from" as "from" | "to",
  });
  const core = useCore();

  const swap = useSwapCalculator({
    fromAmount: computed({
      get() {
        return modules.fromTokenInputGroup.state.amount;
      },
      set(v) {
        modules.fromTokenInputGroup.state.amount = v;
      },
    }),
    toAmount: computed({
      get() {
        return modules.toTokenInputGroup.state.amount;
      },
      set(v) {
        modules.toTokenInputGroup.state.amount = v;
      },
    }),
    fromSymbol: computed({
      get() {
        return modules.fromTokenInputGroup.state.symbol;
      },
      set(v) {
        if (!v) return;
        modules.fromTokenInputGroup.state.symbol = v;
      },
    }),
    toSymbol: computed({
      get() {
        return modules.toTokenInputGroup.state.symbol;
      },
      set(v) {
        if (!v) return;
        modules.toTokenInputGroup.state.symbol = v;
      },
    }),
    balances: computed(() => core.store.wallet.sif.balances),
    selectedField: computed({
      get() {
        return state.activeFieldType;
      },
      set(v) {
        if (!v) return;
        state.activeFieldType = v;
      },
    }),
    slippage: ref(state.slippage),
    poolFinder: core.poolFinder,
  });

  return {
    state,
    modules,
    computed: {
      swap,
    },
    mutations: {
      updateActiveFieldType(v: "to" | "from") {
        state.activeFieldType = v;
      },
      invertPair() {
        const fromState = modules.fromTokenInputGroup.state;
        const toState = modules.toTokenInputGroup.state;
        const fromTokenSymbol = fromState.symbol;
        const toTokenSymbol = toState.symbol;
        const fromTokenAmount = fromState.amount;
        const toTokenAmount = toState.amount;
        modules.fromTokenInputGroup.mutations.updateAsset(toTokenSymbol);
        modules.toTokenInputGroup.mutations.updateAsset(fromTokenSymbol);
        modules.fromTokenInputGroup.mutations.updateAmount(toTokenAmount);
        modules.toTokenInputGroup.mutations.updateAmount(fromTokenAmount);
      },
    },
  };
};

export type SwapPageModule = ReturnType<typeof useSwapPageModule>;

export type TokenInputGroupModule = ReturnType<typeof useTokenInputGroupModule>;
