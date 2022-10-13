import { computed, Ref } from "vue";
import { useQuery } from "vue-query";

import { useAsyncDataCached } from "~/hooks/useAsyncDataCached";
import { useCore } from "~/hooks/useCore";

export function useTokenStats() {
  const { data } = useCore().services;
  return useAsyncDataCached("tokenStats", data.getTokenStats);
}

export function useRewardsPrograms() {
  const { data } = useCore().services;
  return useQuery("rewardsPrograms", data.getRewardsPrograms);
}

/**
 * get LPPD distribution for a given account
 * @param account {string} account address
 */
export function useLPUserRewards(account: Ref<string>) {
  const { data } = useCore().services;

  return useQuery(
    `lpUserRewards-${account.value}`,
    async () => await data.getLPUserRewards(account.value),
    {
      enabled: computed(() => account.value !== ""),
    },
  );
}
