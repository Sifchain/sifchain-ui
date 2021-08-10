import { defineComponent, watch, onMounted } from "vue";
import { computed, ref, ComputedRef, ToRefs } from "@vue/reactivity";
import {
  getAssetLabel,
  getBlockExplorerUrl,
  getRewardEarningsUrl,
  useAssetItem,
} from "@/componentsLegacy/shared/utils";
import { useCore } from "@/hooks/useCore";
import { format } from "@sifchain/sdk/src/utils/format";
import { Amount, Asset, getErrorMessage } from "@sifchain/sdk";

const DECIMALS = 5;

const invalidRewards: Record<string, boolean> = {};
async function getEarnedRewards(address: string, symbol: string) {
  const emptyRes = {
    negative: false,
    netChange: "0.00",
  };

  const asset = Asset.get(symbol);
  symbol = asset.ibcDenom || symbol;

  if (invalidRewards[symbol]) return emptyRes;

  const earnedRewardsUrl = getRewardEarningsUrl();
  const res = await fetch(`${earnedRewardsUrl}/${symbol}/netChange/${address}`);
  const parsedData = await res.json();

  // NOTE(ajoslin): ibc not supported yet for this endpoint...
  // to not spam the logs with invalid calls to this endpoint,
  // after 1 error stop trying.
  if (!res.ok) {
    invalidRewards[symbol] = true;
    return emptyRes;
  }

  // TD - This should return Amount, method needs work
  // Rudis recent work should refactor this call too into a testable service
  return {
    negative: Amount(parsedData.netChangeUSDT.toString()).lessThan("0"),
    netChange: format(Amount(Math.abs(parsedData.netChangeUSDT).toString()), {
      mantissa: 2,
    }),
  };
}

export const useUserPoolData = (props: ToRefs<{ externalAsset: string }>) => {
  const { config, store, services, accountPoolFinder, poolFinder } = useCore();

  const address = computed(() => store.wallet.sif.address);
  const earnedRewards = ref<string | null>(null);
  const earnedRewardsNegative = ref<boolean>(false);

  const accountPool = computed(() => {
    const storeAccountPool = accountPoolFinder(
      props.externalAsset.value,
      "rowan",
    )?.value;

    const pool = poolFinder(props.externalAsset.value, "rowan")?.value;

    if (!storeAccountPool) return null;

    // enrich pool ticker with pool object
    return {
      ...storeAccountPool,
      pool,
    };
  });

  const fromSymbol = computed(
    () => accountPool?.value?.pool?.externalAmount?.symbol || "",
  );

  // const USDTImage = useAssetItem('USDT').token.value?.imageUrl;
  const USDTImage =
    "https://assets.coingecko.com/coins/images/325/thumb/Tether-logo.png?1598003707";

  const fromAsset = useAssetItem(fromSymbol);
  const fromToken = fromAsset.token;
  const fromBackgroundStyle = fromAsset.background;
  const fromTokenImage = computed(() => {
    if (!fromToken.value) return "";
    const t = fromToken.value;
    return t.imageUrl;
  });

  const calculateRewards = async (address: string, fromSymbol: string) => {
    // TODO - needs a better pattern to handle this
    if (!address || !fromSymbol) return;

    const earnedRewardsObject = await getEarnedRewards(
      address,
      fromSymbol?.toLowerCase(),
    );
    earnedRewardsNegative.value = earnedRewardsObject.negative;
    earnedRewards.value = earnedRewardsObject.netChange;
  };

  watch([address, fromSymbol], async () => {
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
  const toAsset = useAssetItem(toSymbol);
  const toToken = toAsset.token;
  const toBackgroundStyle = toAsset.background;
  const toTokenImage = computed(() => {
    if (!toToken.value) return "";
    const t = toToken.value;
    return t.imageUrl;
  });

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
    fromToken,
    fromSymbol,
    fromBackgroundStyle,
    fromTokenImage,
    fromTotalValue,
    toSymbol,
    toBackgroundStyle,
    toTokenImage,
    toTotalValue,
    myPoolUnits,
    myPoolShare,
    chainId: config.sifChainId,
    getBlockExplorerUrl,
    earnedRewards,
    earnedRewardsNegative,
    USDTImage,
  };
};
