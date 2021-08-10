import { defineComponent, ref, watch, onMounted } from "vue";
import Layout from "@/componentsLegacy/Layout/Layout.vue";
import { useWalletButton } from "@/componentsLegacy/WithWallet/useWalletButton";
import {
  Asset,
  LiquidityProvider,
  PoolState,
  TransactionStatus,
  useRemoveLiquidityCalculator,
} from "@sifchain/sdk";
import { useCore } from "@/hooks/useCore";
import { useRoute, useRouter } from "vue-router";
import { computed, effect, Ref, toRef } from "@vue/reactivity";
import { getLMData } from "@/componentsLegacy/shared/utils";
import { useAssetBySymbol } from "@/hooks/useAssetBySymbol";
import { debounce } from "@/views/utils/debounce";

export function useRemoveLiquidityData() {
  const { store, usecases, poolFinder, services, config } = useCore();
  const route = useRoute();
  const router = useRouter();

  const transactionStatus = ref<TransactionStatus | null>(null);

  const modalStatus = ref<"setup" | "confirm" | "processing">("setup");

  const asymmetry = ref("0");
  const wBasisPoints = ref("0");
  const nativeAssetSymbol = ref("rowan");
  const lmRewards = ref<any>();
  const externalAssetSymbol = ref<string | null>(
    route.params.externalAsset ? route.params.externalAsset.toString() : null,
  );
  const { connected } = useWalletButton();

  const liquidityProvider = ref(null) as Ref<LiquidityProvider | null>;
  const withdrawExternalAssetAmount: Ref<string | null> = ref(null);
  const withdrawNativeAssetAmount: Ref<string | null> = ref(null);
  const address = computed(() => store.wallet.sif.address);
  const state = ref(0);

  const externalAsset = computed(() =>
    Asset.get(externalAssetSymbol.value as string),
  );

  effect(() => {
    if (!externalAssetSymbol.value) return null;
    services.clp
      .getLiquidityProvider({
        assetSymbol: externalAsset.value?.symbol,
        symbol: externalAsset.value?.ibcDenom || externalAsset.value?.symbol,
        lpAddress: store.wallet.sif.address,
      })
      .then((liquidityProviderResult) => {
        liquidityProvider.value = liquidityProviderResult;
      });
  });

  onMounted(async () => {
    lmRewards.value = await getLMData(address, config.sifChainId);
  });

  // if these values change, recalculate state and asset amounts
  watch(
    [wBasisPoints, asymmetry, liquidityProvider],
    debounce(() => {
      const calcData = useRemoveLiquidityCalculator({
        externalAssetSymbol,
        nativeAssetSymbol,
        wBasisPoints,
        asymmetry,
        liquidityProvider,
        sifAddress: toRef(store.wallet.sif, "address"),
        poolFinder,
      });
      state.value = calcData.state;
      withdrawExternalAssetAmount.value = calcData.withdrawExternalAssetAmount;
      withdrawNativeAssetAmount.value = calcData.withdrawNativeAssetAmount;
    }, 200),
  );

  return {
    connected,
    state,
    nativeAsset: useAssetBySymbol(nativeAssetSymbol),
    externalAsset: useAssetBySymbol(externalAssetSymbol),
    nextStepMessage: computed(() => {
      switch (state.value) {
        case PoolState.SELECT_TOKENS:
          return "Select Tokens";
        case PoolState.ZERO_AMOUNTS:
          return "Please enter an amount";
        case PoolState.NO_LIQUIDITY:
          return "No liquidity available.";
        case PoolState.INSUFFICIENT_FUNDS:
          return "Insufficient funds in this pool";
        case PoolState.VALID_INPUT:
          return "Remove Liquidity";
      }
    }),
    nextStepAllowed: computed(() => {
      return state.value === PoolState.VALID_INPUT;
    }),
    handleSelectClosed(data: string | MouseEvent) {
      if (typeof data !== "string") {
        return;
      }

      externalAssetSymbol.value = data;
    },
    handleNextStepClicked() {
      if (!externalAssetSymbol.value || !wBasisPoints.value || !asymmetry.value)
        return;

      modalStatus.value = "confirm";
    },
    async handleAskConfirmClicked() {
      if (!externalAssetSymbol.value || !wBasisPoints.value || !asymmetry.value)
        return;

      modalStatus.value = "processing";

      transactionStatus.value = {
        state: "requested",
        hash: "",
      };
      transactionStatus.value = await usecases.clp.removeLiquidity(
        Asset.get(externalAssetSymbol.value),
        wBasisPoints.value,
        asymmetry.value,
      );
    },

    PoolState,
    wBasisPoints,
    asymmetry,
    nativeAssetSymbol,
    withdrawExternalAssetAmount,
    withdrawNativeAssetAmount,
    externalAssetSymbol,
    transactionStatus,
    modalStatus,
    lmRewards,
  };
}
