import { useCore } from "~/hooks/useCore";
import { isNil } from "~/utils/assertion";
import BigNumber from "bignumber.js";
import { computed, Ref } from "vue";

import { useTokenRegistryEntriesQuery } from "../../tokenRegistry/queries/tokenRegistry";
import { useLiquidityProviderQuery } from "./liquidityProvider";

export const useUnlockLiquidityByPercentage = (
  externalAssetBaseDenom: Ref<string>,
  percentage: Ref<number>,
) => {
  const { config } = useCore();
  const lpQuery = useLiquidityProviderQuery(externalAssetBaseDenom);
  const tokenEntries = useTokenRegistryEntriesQuery();

  return computed(() => {
    if (!isNil(lpQuery?.error.value) || !isNil(tokenEntries.error.value)) {
      return { status: "rejected" as const };
    }

    if (lpQuery?.isLoading.value || tokenEntries.isLoading.value) {
      return { status: "pending" as const };
    }

    const externalAssetBalance = lpQuery?.data.value?.externalAssetBalance;
    const nativeAssetBalance = lpQuery?.data.value?.nativeAssetBalance;
    const lp = lpQuery?.data.value?.liquidityProvider;

    const externalAssetFractionalDigits =
      tokenEntries.data.value?.registry?.entries
        .find((x) => x.denom === lp?.asset?.symbol)
        ?.decimals.toNumber();
    const nativeAssetFractionalDigits =
      tokenEntries.data.value?.registry?.entries
        .find((x) => x.denom === config.nativeAsset.symbol)
        ?.decimals.toNumber();

    const roundedUnits = new BigNumber(percentage.value)
      .dividedBy(100)
      .multipliedBy(lp?.liquidityProviderUnits ?? 0)
      .integerValue();

    const percentageAdjustedForRoundedUnits = roundedUnits.dividedBy(
      lp?.liquidityProviderUnits ?? 1,
    );

    return {
      status: "fulfilled" as const,
      units: roundedUnits,
      externalAssetAmount: new BigNumber(externalAssetBalance ?? "0")
        .shiftedBy(-(externalAssetFractionalDigits ?? 0))
        .multipliedBy(percentageAdjustedForRoundedUnits),
      nativeAssetAmount: new BigNumber(nativeAssetBalance ?? "0")
        .shiftedBy(-(nativeAssetFractionalDigits ?? 0))
        .multipliedBy(percentageAdjustedForRoundedUnits),
    };
  });
};
