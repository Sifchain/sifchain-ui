import { defineComponent, watch, onMounted } from "vue";
import { computed, ref, ComputedRef, ToRefs } from "@vue/reactivity";
import {
  getAssetLabel,
  getBlockExplorerUrl,
  getRewardEarningsUrl,
} from "@/componentsLegacy/shared/utils";
import { useCore } from "@/hooks/useCore";
import { format } from "@sifchain/sdk/src/utils/format";
import { Amount, getErrorMessage, IAsset, Network } from "@sifchain/sdk";

const DECIMALS = 5;

const invalidRewards: Record<string, boolean> = {};
async function getEarnedRewards(address: string, asset?: IAsset) {
  const emptyRes = {
    negative: false,
    netChange: "0.00",
  };
  if (!asset) return emptyRes;

  const registryEntry = await useCore().services.tokenRegistry.findAssetEntry(
    asset,
  );

  if (!registryEntry) return emptyRes;
  if (invalidRewards[registryEntry.denom]) return emptyRes;

  const earnedRewardsUrl = getRewardEarningsUrl();
  const res = await fetch(
    `${earnedRewardsUrl}/${registryEntry.denom.replace(
      "ibc/",
      "ibc_",
    )}/netChange/${address}`,
  );
  const parsedData = await res.json();

  // NOTE(ajoslin): ibc not supported yet for this endpoint...
  // to not spam the logs with invalid calls to this endpoint,
  // after 1 error stop trying.
  if (!res.ok) {
    invalidRewards[registryEntry.denom] = true;
    return emptyRes;
  }

  // TD - This should return Amount, method needs work
  // Rudis recent work should refactor this call too into a testable service
  return {
    negative: Amount((parsedData.netChangeUSDT || "0").toString()).lessThan(
      "0",
    ),
    netChange: format(
      Amount(Math.abs(parsedData.netChangeUSDT || "0").toString()),
      {
        mantissa: 2,
      },
    ),
  };
}

export const useUserPoolData = (props: ToRefs<{ externalAsset: string }>) => {
  const { config, store, accountPoolFinder, poolFinder } = useCore();

  const address = computed(() => store.wallet.get(Network.SIFCHAIN).address);
  const earnedRewards = ref<string | null>(null);
  const earnedRewardsNegative = ref<boolean>(false);

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

  // const USDTImage = useAssetItem('USDT').token.value?.imageUrl;
  const USDTImage =
    "https://assets.coingecko.com/coins/images/325/thumb/Tether-logo.png?1598003707";

  const fromAsset = computed(() => {
    return useCore()
      .services.chains.get(Network.SIFCHAIN)
      .findAssetWithLikeSymbol(fromSymbol.value);
  });
  const toAsset = computed(() => {
    return useCore()
      .services.chains.get(Network.SIFCHAIN)
      .findAssetWithLikeSymbol(toSymbol.value);
  });

  const calculateRewards = async (address: string, fromSymbol: string) => {
    // TODO - needs a better pattern to handle this
    if (!address || !fromSymbol) return;

    const earnedRewardsObject = await getEarnedRewards(
      address,
      fromAsset.value,
    );
    earnedRewardsNegative.value = earnedRewardsObject.negative;
    earnedRewards.value = earnedRewardsObject.netChange;
  };

  watch([address, fromSymbol], async (val, oldVal) => {
    calculateRewards(address.value, fromSymbol.value);
  });

  onMounted(async () => {
    calculateRewards(address.value, fromSymbol.value);
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
    earnedRewards,
    earnedRewardsNegative,
    USDTImage,
  };
};
