import { defineComponent, ref, watch, onMounted } from "vue";
import Layout from "@/componentsLegacy/Layout/Layout";
import { useWalletButton } from "@/componentsLegacy/WithWallet/useWalletButton";
import { LiquidityProvider, Network, TransactionStatus } from "@sifchain/sdk";
import { useCore } from "@/hooks/useCore";
import { useRoute, useRouter } from "vue-router";
import { computed, effect, Ref, toRef } from "@vue/reactivity";
import { formatAssetAmount, getLMData } from "@/componentsLegacy/shared/utils";
import { useAssetBySymbol } from "@/hooks/useAssetBySymbol";
import { debounce } from "@/views/utils/debounce";
import { accountStore } from "@/store/modules/accounts";
import { useRemoveLiquidityCalculator } from "@/business/calculators";
import { PoolState } from "@/business/calculators/addLiquidityCalculator";

export function useRemoveLiquidityData() {
  const { usecases, poolFinder, services, config } = useCore();
  const route = useRoute();

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
  const address = accountStore.refs.sifchain.address.computed();
  const state = ref(0);

  const nativeAsset = computed(() =>
    services.chains
      .get(Network.SIFCHAIN)
      .findAssetWithLikeSymbol(nativeAssetSymbol.value || ""),
  );
  const externalAsset = computed(() =>
    services.chains
      .get(Network.SIFCHAIN)
      .findAssetWithLikeSymbol(externalAssetSymbol.value || ""),
  );

  effect(() => {
    if (!externalAsset.value) return null;
    services.clp
      .getLiquidityProvider({
        asset: externalAsset.value,
        lpAddress: address.value,
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
        sifAddress: address,
        poolFinder,
      });
      state.value = calcData.state;
      withdrawExternalAssetAmount.value = calcData.withdrawExternalAssetAmount;
      withdrawNativeAssetAmount.value = calcData.withdrawNativeAssetAmount;
    }, 200),
  );

  return {
    connected,
    nativeAsset,
    externalAsset,
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

      modalStatus.value = "confirm";
    },
    async handleAskConfirmClicked() {
      if (!externalAsset.value || !wBasisPoints.value || !asymmetry.value)
        return;

      modalStatus.value = "processing";

      transactionStatus.value = {
        state: "requested",
        hash: "",
      };
      transactionStatus.value = await usecases.clp.removeLiquidity(
        externalAsset.value,
        wBasisPoints.value,
        asymmetry.value,
      );

      const percentRemoved = ((+wBasisPoints.value / 10000) * 100).toFixed(0);
      if (transactionStatus.value.state === "accepted") {
        useCore().services.bus.dispatch({
          type: "SuccessEvent",
          payload: {
            message:
              `Withdrew ${percentRemoved}% of your liquidity from ` +
              `${nativeAssetSymbol.value.toUpperCase()} / ${externalAsset.value.displaySymbol.toUpperCase()} pool as ` +
              [
                withdrawNativeAssetAmount.value &&
                  +withdrawNativeAssetAmount.value > 0 &&
                  `${
                    withdrawNativeAssetAmount.value
                  } ${nativeAsset.value?.displaySymbol.toUpperCase()}`,
                withdrawExternalAssetAmount.value &&
                  +withdrawExternalAssetAmount.value > 0 &&
                  `${
                    withdrawExternalAssetAmount.value
                  } ${externalAsset.value?.displaySymbol.toUpperCase()}`,
              ]
                .filter(Boolean)
                .join(" and "),
          },
        });
      }
      setTimeout(() => {
        usecases.clp.syncPools.syncUserPools(
          accountStore.state.sifchain.address,
        );
        usecases.clp.syncPools.syncPublicPools();
        accountStore.updateBalances(Network.SIFCHAIN);
      }, 1000);
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
