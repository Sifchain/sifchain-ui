import { Ref, computed } from "vue";

import {
  Amount,
  Asset,
  AssetAmount,
  IAsset,
  LiquidityProvider,
  Pool,
  format,
} from "@sifchain/sdk";
import { calculateWithdrawal } from "@sifchain/sdk/src/entities/formulae";

import { PoolState } from "./addLiquidityCalculator";

export function useRemoveLiquidityCalculator(input: {
  externalAssetSymbol: Ref<string | null>;
  nativeAssetSymbol: Ref<string | null>;
  wBasisPoints: Ref<string | null>;
  asymmetry: Ref<string | null>;
  poolFinder: (a: IAsset | string, b: IAsset | string) => Ref<Pool> | null;
  liquidityProvider: Ref<LiquidityProvider | null>;
  sifAddress: Ref<string>;
}) {
  // this function needs to be refactored so
  const externalAsset = computed(() => {
    if (!input.externalAssetSymbol.value) return undefined;
    return Asset(input.externalAssetSymbol.value);
  });

  const nativeAsset = computed(() => {
    if (!input.nativeAssetSymbol.value) return undefined;
    return Asset(input.nativeAssetSymbol.value);
  });

  const liquidityPool = computed(() => {
    if (!nativeAsset.value || !externalAsset.value) return undefined;

    // Find pool from poolFinder
    const pool = input.poolFinder(externalAsset.value, nativeAsset.value);
    return pool?.value ?? null;
  });

  const poolUnits = computed(() => liquidityPool.value?.poolUnits);

  const wBasisPoints = computed(() => {
    if (!input.wBasisPoints.value) return null;
    return Amount(input.wBasisPoints.value);
  });

  const asymmetry = computed(() => {
    if (!input.asymmetry.value) return null;
    return Amount(input.asymmetry.value);
  });

  const nativeAssetBalance = computed(() =>
    liquidityPool.value?.amounts.find(
      (a) => a.symbol === input.nativeAssetSymbol.value,
    ),
  );

  const externalAssetBalance = computed(
    () =>
      liquidityPool.value?.amounts.find(
        (a) => a.symbol === input.externalAssetSymbol.value,
      ) ?? null,
  );

  const lpUnits = computed(() => {
    if (!input.liquidityProvider.value) return null;

    return input.liquidityProvider.value.units;
  });

  const hasLiquidity = computed(() => lpUnits.value?.greaterThan("0"));

  const withdrawalAmounts = computed(() => {
    if (
      !poolUnits.value ||
      !nativeAssetBalance.value ||
      !externalAssetBalance.value ||
      !lpUnits.value ||
      !wBasisPoints.value ||
      !asymmetry.value ||
      !externalAsset.value ||
      !nativeAsset.value
    )
      return null;

    const { withdrawExternalAssetAmount, withdrawNativeAssetAmount } =
      calculateWithdrawal({
        poolUnits: poolUnits.value,
        nativeAssetBalance: nativeAssetBalance.value,
        externalAssetBalance: externalAssetBalance.value,
        lpUnits: lpUnits.value,
        wBasisPoints: wBasisPoints.value,
        asymmetry: asymmetry.value,
      });

    return {
      hasLiquidity,
      withdrawExternalAssetAmount: AssetAmount(
        externalAsset.value,
        withdrawExternalAssetAmount,
      ),
      withdrawNativeAssetAmount: AssetAmount(
        nativeAsset.value,
        withdrawNativeAssetAmount,
      ),
    };
  });

  const state = computed(() => {
    if (!input.externalAssetSymbol.value || !input.nativeAssetSymbol.value)
      return PoolState.SELECT_TOKENS;

    if (!wBasisPoints.value?.greaterThan("0")) return PoolState.ZERO_AMOUNTS;

    if (!hasLiquidity.value) return PoolState.NO_LIQUIDITY;
    if (!lpUnits.value) {
      return PoolState.INSUFFICIENT_FUNDS;
    }

    return PoolState.VALID_INPUT;
  });

  const withdrawExternalAssetAmountMessage = computed(() => {
    if (!withdrawalAmounts.value) return "";
    const assetAmount = withdrawalAmounts.value?.withdrawExternalAssetAmount;
    return format(assetAmount.amount, assetAmount.asset, {
      mantissa: 6,
    });
  });

  const withdrawNativeAssetAmountMessage = computed(() => {
    if (!withdrawalAmounts.value) return "";
    const assetAmount = withdrawalAmounts.value?.withdrawNativeAssetAmount;
    return format(assetAmount.amount, assetAmount.asset, {
      mantissa: 6,
    });
  });

  return {
    withdrawExternalAssetAmount: withdrawExternalAssetAmountMessage,
    withdrawNativeAssetAmount: withdrawNativeAssetAmountMessage,
    state,
  };
}
