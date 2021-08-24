import { computed, ComputedRef } from "vue";
import { useAsyncData } from "@/hooks/useAsyncData";
import { useCore } from "@/hooks/useCore";
import { getExistingClaimsData } from "@/componentsLegacy/shared/utils";
import { accountStore } from "@/store/modules/accounts";

// TODO REACTIVE

const useLiquidityMiningData = (address: ComputedRef<string>) => {
  const { services } = useCore();
  const addressChanged = computed(() => !!address.value);
  return computed(() => {
    return useAsyncData(async () => {
      // return null;
      if (!address.value) return null;
      return services.cryptoeconomics.fetchLmData({
        address: address.value,
      });
    }, addressChanged);
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
  sifApiUrl: string,
) => {
  return computed(() => {
    return useAsyncData(async () => {
      return {
        lm: false,
        vs: false,
      };
      if (!address.value) return null;
      return getExistingClaimsData(address, sifApiUrl);
    });
  });
};

export const useRewardsPageData = () => {
  const { config, services } = useCore();
  const address = accountStore.refs.sifchain.address.computed();

  const lmRes = useLiquidityMiningData(address);

  const vsRes = useValidatorSubsidyData(address);
  const claimsRes = useExistingClaimsData(address, config.sifApiUrl);

  const isLoading = computed(() => {
    return (
      lmRes.value.isLoading.value ||
      vsRes.value.isLoading.value ||
      claimsRes.value.isLoading.value
    );
  });
  const error = computed(() => {
    return (
      lmRes.value.error.value ||
      vsRes.value.error.value ||
      claimsRes.value.error.value
    );
  });

  const vsInfoLink = computed(() =>
    services.cryptoeconomics.getAddressLink(address.value, "vs"),
  );
  const lmInfoLink = computed(() =>
    services.cryptoeconomics.getAddressLink(address.value, "lm"),
  );

  return {
    address,
    isLoading,
    error,
    lmData: computed(() => lmRes.value.data.value),
    vsData: computed(() => vsRes.value.data.value),
    vsClaim: computed(() => claimsRes.value.data.value?.lm),
    lmClaim: computed(() => claimsRes.value.data.value?.vs),
    vsInfoLink,
    lmInfoLink,
  };
};
