import { computed, ComputedRef, ref, watch } from "vue";
import { useAsyncData } from "@/hooks/useAsyncData";
import { useCore } from "@/hooks/useCore";
import { getExistingClaimsData } from "@/componentsLegacy/shared/utils";
import { accountStore } from "@/store/modules/accounts";
import { QueryClaimsByTypeRequest } from "../../../../core/src/generated/proto/sifnode/dispensation/v1/query";
import { NativeDexClient } from "../../../../core/src/services/utils/SifClient/NativeDexClient";
import { DistributionType } from "../../../../core/src/generated/proto/sifnode/dispensation/v1/types";
import { flagsStore } from "@/store/modules/flags";

// TODO REACTIVE

const useLiquidityMiningData = (
  address: ComputedRef<string>,
  rewardProgram?: "harvest",
) => {
  const { services } = useCore();
  return useAsyncData(async () => {
    // return null;
    if (!address.value) return null;
    return services.cryptoeconomics.fetchLmData({
      address: address.value,
      rewardProgram,
      devnet: flagsStore.state.devnetCryptoecon,
    });
  }, [address]);
};

const useValidatorSubsidyData = (address: ComputedRef<string>) => {
  const { services } = useCore();
  return useAsyncData(async () => {
    return null;
    if (!address.value) return null;
    return services.cryptoeconomics.fetchVsData({
      address: address.value,
      devnet: flagsStore.state.devnetCryptoecon,
    });
  }, [address]);
};

const useExistingClaimsData = (
  address: ComputedRef<string>,
  sifRpcUrl: string,
) => {
  const res = useAsyncData(async () => {
    if (!address.value) return null;
    const nativeDexClient = await NativeDexClient.connect(sifRpcUrl);
    const claims = await nativeDexClient.query.dispensation.ClaimsByType({
      userClaimType: DistributionType.DISTRIBUTION_TYPE_LIQUIDITY_MINING,
    });
    const userClaims = claims.claims.filter(
      (c) => c.userAddress === address.value,
    );
    const lm = userClaims.some(
      (c) =>
        c.userClaimType === DistributionType.DISTRIBUTION_TYPE_LIQUIDITY_MINING,
    );
    const vs = userClaims.some(
      (c) =>
        c.userClaimType ===
        DistributionType.DISTRIBUTION_TYPE_VALIDATOR_SUBSIDY,
    );
    return {
      lm: lm,
      vs: vs,
    };
  }, [address]);
  return res;
};

export const useRewardsPageData = () => {
  const { config, services } = useCore();
  const address = accountStore.refs.sifchain.address.computed();

  const lmRes = useLiquidityMiningData(address);
  const lmHarvestRes = useLiquidityMiningData(address, "harvest");

  const vsRes = useValidatorSubsidyData(address);
  const claimsRes = useExistingClaimsData(address, config.sifRpcUrl);

  const summaryAPYRes = useAsyncData(
    async () =>
      (await services.cryptoeconomics.fetchSummaryAPY({
        rewardProgram: "harvest",
        devnet: flagsStore.state.devnetCryptoecon,
      })) +
      (await services.cryptoeconomics.fetchSummaryAPY({
        devnet: flagsStore.state.devnetCryptoecon,
      })),
  );

  const isLoading = computed(() => {
    return (
      !accountStore.state.sifchain.address ||
      lmRes.isLoading.value ||
      lmHarvestRes.isLoading.value ||
      summaryAPYRes.isLoading.value ||
      vsRes.isLoading.value ||
      claimsRes.isLoading.value
    );
  });
  const error = computed(() => {
    return lmRes.error.value || vsRes.error.value || claimsRes.error.value;
  });

  const vsInfoLink = computed(() =>
    services.cryptoeconomics.getAddressLink(address.value, "vs"),
  );
  const lmInfoLink = computed(
    () =>
      "https://docs.sifchain.finance/resources/rewards-programs#ibc-cosmos-assets-liquidity-mining-program",
    // services.cryptoeconomics.getAddressLink(address.value, "lm"),
  );

  return {
    address,
    isLoading,
    error,
    lmData: computed(() => lmRes.data.value),
    lmHarvestData: computed(() => lmHarvestRes.data.value),
    vsData: computed(() => vsRes.data.value),
    vsClaim: computed(() => claimsRes.data.value?.vs),
    lmClaim: computed(() => claimsRes.data.value?.lm),
    reloadClaims: () => claimsRes.reload.value(),
    summaryAPY: computed(() => summaryAPYRes.data.value),
    vsInfoLink,
    lmInfoLink,
  };
};
