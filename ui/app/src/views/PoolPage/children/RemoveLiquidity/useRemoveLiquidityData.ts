import { defineComponent, ref, watch, onMounted } from "vue";
import Layout from "@/componentsLegacy/Layout/Layout.vue";
import { useWalletButton } from "@/componentsLegacy/WithWallet/useWalletButton";
import {
  Asset,
  LiquidityProvider,
  PoolState,
  useRemoveLiquidityCalculator,
} from "@sifchain/sdk";
import { useCore } from "@/hooks/useCore";
import { useRoute, useRouter } from "vue-router";
import { computed, effect, Ref, toRef } from "@vue/reactivity";
import ActionsPanel from "@/componentsLegacy/ActionsPanel/ActionsPanel.vue";
import AssetItem from "@/componentsLegacy/AssetItem/AssetItem.vue";
import Slider from "@/componentsLegacy/Slider/Slider.vue";
import { ConfirmState } from "@/types";
import ConfirmationModal from "@/componentsLegacy/ConfirmationModal/ConfirmationModal.vue";
import DetailsPanelRemove from "@/componentsLegacy/DetailsPanelRemove/DetailsPanelRemove.vue";
import { getLMData } from "@/componentsLegacy/shared/utils";
import { toConfirmState } from "@/views/utils/toConfirmState";

export function useRemoveLiquidityData() {
  const { store, usecases, poolFinder, services, config } = useCore();
  const route = useRoute();
  const router = useRouter();
  const transactionState = ref<ConfirmState>("selecting");
  const transactionHash = ref<string | null>(null);
  const transactionStateMsg = ref<string>("");
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

  effect(() => {
    if (!externalAssetSymbol.value) return null;
    services.clp
      .getLiquidityProvider({
        symbol: externalAssetSymbol.value,
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
  watch([wBasisPoints, asymmetry, liquidityProvider], () => {
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
  });

  return {
    connected,
    state,
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

      transactionState.value = "confirming";
    },
    async handleAskConfirmClicked() {
      if (!externalAssetSymbol.value || !wBasisPoints.value || !asymmetry.value)
        return;

      transactionState.value = "signing";
      const tx = await usecases.clp.removeLiquidity(
        Asset.get(externalAssetSymbol.value),
        wBasisPoints.value,
        asymmetry.value,
      );
      transactionHash.value = tx.hash;
      transactionState.value = toConfirmState(tx.state); // TODO: align states
      transactionStateMsg.value = tx.memo ?? "";
    },

    requestTransactionModalClose() {
      if (transactionState.value === "confirmed") {
        router.push("/pool");
      } else {
        transactionState.value = "selecting";
      }
    },
    PoolState,
    wBasisPoints,
    asymmetry,
    nativeAssetSymbol,
    withdrawExternalAssetAmount,
    withdrawNativeAssetAmount,
    externalAssetSymbol,
    transactionState,
    transactionHash,
    lmRewards,
  };
}
