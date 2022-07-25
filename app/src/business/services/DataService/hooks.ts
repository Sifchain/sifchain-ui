import { useAsyncDataCached } from "@/hooks/useAsyncDataCached";
import DataService from "./DataService";

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
 * @param address {string} account address
 * @returns
 */
export function useLPUserRewards(account: string) {
  return useAsyncDataCached(`lpUserRewards-${account}`, () =>
    dataService.getLPUserRewards(account),
  );
}
