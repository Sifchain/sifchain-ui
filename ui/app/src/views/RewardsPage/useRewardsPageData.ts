import { computed, ComputedRef, ref, watch } from "vue";
import { useAsyncData } from "@/hooks/useAsyncData";
import { useCore } from "@/hooks/useCore";
import { getExistingClaimsData } from "@/componentsLegacy/shared/utils";
import { accountStore } from "@/store/modules/accounts";
import { QueryClaimsByTypeRequest } from "../../../../core/src/generated/proto/sifnode/dispensation/v1/query";
import { NativeDexClient } from "../../../../core/src/services/utils/SifClient/NativeDexClient";
import { DistributionType } from "../../../../core/src/generated/proto/sifnode/dispensation/v1/types";

// TODO REACTIVE

const useLiquidityMiningData = (address: ComputedRef<string>) => {
  const { services } = useCore();
  return computed(() => {
    return useAsyncData(async () => {
      // return null;
      if (!address.value) return null;
      return services.cryptoeconomics.fetchLmData({
        address: address.value,
      });
    }, [address]);
  });
};

const useValidatorSubsidyData = (address: ComputedRef<string>) => {
  const { services } = useCore();
  return computed(() => {
    return useAsyncData(async () => {
      return null;
      if (!address.value) return null;
      return services.cryptoeconomics.fetchVsData({
        address: address.value,
      });
    });
  });
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

  const vsRes = useValidatorSubsidyData(address);
  const claimsRes = useExistingClaimsData(address, config.sifRpcUrl);
  QueryClaimsByTypeRequest;
  const isLoading = computed(() => {
    return (
      lmRes.value.isLoading.value ||
      vsRes.value.isLoading.value ||
      claimsRes.isLoading.value
    );
  });
  const error = computed(() => {
    return (
      lmRes.value.error.value ||
      vsRes.value.error.value ||
      claimsRes.error.value
    );
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
    lmData: computed(() => lmRes.value.data.value),
    vsData: computed(() => vsRes.value.data.value),
    vsClaim: computed(() => claimsRes.data.value?.vs),
    lmClaim: computed(() => claimsRes.data.value?.lm),
    vsInfoLink,
    lmInfoLink,
  };
};
