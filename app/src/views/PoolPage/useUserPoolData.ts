import { computed, ref, ToRefs } from "vue";

import { getAssetLabel, getBlockExplorerUrl } from "~/components/utils";
import { useCore } from "~/hooks/useCore";
import { format } from "@sifchain/sdk/src/utils/format";
import { Amount } from "@sifchain/sdk";
import { useNativeChain } from "~/hooks/useChains";

const DECIMALS = 5;

export function useUserPoolData(props: ToRefs<{ externalAsset: string }>) {
  const { config, store, accountPoolFinder, poolFinder } = useCore();

  const fromSymbol = ref("");
  const accountPool = computed(() => {
    const storeAccountPool = accountPoolFinder(
      props.externalAsset.value,
      "rowan",
    )?.value;

    const pool = poolFinder(props.externalAsset.value, "rowan")?.value;

    if (!storeAccountPool) return null;

    // Conditionally set this because accountPool object actually gets
    // called a lot...
    // And each time this gets changed it triggers the watch below
    // and re-fetches user earnedRewards
    const symbol = pool?.externalAmount?.symbol;
    if (symbol && symbol !== fromSymbol.value) {
      fromSymbol.value = symbol;
    }

    // enrich pool ticker with pool object
    return {
      ...storeAccountPool,
      pool,
    };
  });

  const fromAsset = computed(() => {
    return useNativeChain().findAssetWithLikeSymbol(fromSymbol.value);
  });
  const toAsset = computed(() => {
    return useNativeChain().findAssetWithLikeSymbol(toSymbol.value);
  });

  const fromTotalValue = computed(() => {
    const aAmount = accountPool?.value?.pool?.externalAmount;
    if (!aAmount) return "";
    return format(aAmount.amount, aAmount.asset, { mantissa: DECIMALS });
  });

  const toSymbol = computed(() =>
    accountPool?.value?.pool?.nativeAmount?.asset
      ? getAssetLabel(accountPool.value.pool?.nativeAmount.asset)
      : "",
  );

  const toTotalValue = computed(() => {
    const aAmount = accountPool?.value?.pool?.nativeAmount;
    if (!aAmount) return "";
    return format(aAmount.amount, aAmount.asset, { mantissa: DECIMALS });
  });

  const poolUnitsAsFraction = computed(
    () => accountPool?.value?.lp.units || Amount("0"),
  );

  const myPoolShare = computed(() => {
    if (!accountPool?.value?.pool?.poolUnits) return null;

    const perc = format(
      poolUnitsAsFraction.value
        .divide(accountPool?.value?.pool?.poolUnits)
        .multiply("100"),
      { mantissa: 4 },
    );

    return `${perc}`;
  });
  const myPoolUnits = computed(() => {
    return format(poolUnitsAsFraction.value, { mantissa: DECIMALS });
  });
  return {
    accountPool,
    fromAsset,
    fromSymbol,
    fromTotalValue,
    toSymbol,
    toTotalValue,
    toAsset,
    myPoolUnits,
    myPoolShare,
    chainId: config.sifChainId,
    getBlockExplorerUrl,
  };
}
