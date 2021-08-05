import { computed, ComputedRef } from "vue";
import { useAsyncData } from "@/hooks/useAsyncData";
import { useCore } from "@/hooks/useCore";
import { getExistingClaimsData } from "@/componentsLegacy/shared/utils";

// TODO REACTIVE

const useLiquidityMiningData = (address: ComputedRef<string>) => {
  const { services } = useCore();
  return computed(() => {
    return useAsyncData(async () => {
      if (true) return null;
      if (!address.value) return null;
      return services.cryptoeconomics.fetchLmData({
        address: address.value,
      });
    });
  });
};

const useValidatorSubsidyData = (address: ComputedRef<string>) => {
  const { services } = useCore();
  return computed(() => {
    return useAsyncData(async () => {
      if (true) return null;
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
      if (true)
        return {
          lm: false,
          vs: false,
        };
      if (!address.value) return null;
      return getExistingClaimsData(address, sifApiUrl);
    });
  });
};

export const useRewardsPageData = (props: { address: string }) => {
  props.address = props.address || "sif10c6s2u0ga576jsah6979wjc58uuchd864llzty";

  const { store, config, services } = useCore();
  const address = computed(() => store.wallet.sif.address);

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
