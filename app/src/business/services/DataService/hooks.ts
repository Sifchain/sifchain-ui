import { useAsyncDataCached } from "@/hooks/useAsyncDataCached";

import DataService, { LPUserReward, LPUserRewards } from "./DataService";

const dataService = new DataService();

export function useTokenStats() {
  return useAsyncDataCached("tokenStats", dataService.getTokenStats);
}

export function useRewardsPrograms() {
  return useAsyncDataCached("rewardsPrograms", dataService.getRewardsPrograms);
}

export function useUserRewards(address: string) {
  return useAsyncDataCached(`userRewards-${address}`, () =>
    dataService.getUserRewards(address),
  );
}

/**
 * get LPPD distribution for a given account
 * @param account {string} account address
 */
export function useLPUserRewards(account: string) {
  return useAsyncDataCached(`lpUserRewards-${account}`, async () => {
    const { received } = await dataService.getLPUserRewards(account);

    if (!received) {
      return {} as Record<string, LPUserReward>;
    }

    return received.reduce(
      (acc, x) => ({
        ...acc,
        [x.poolDenom]: x,
      }),
      {} as Record<string, LPUserReward>,
    );
  });
}
