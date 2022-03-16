import { PoolStatsResponseData } from "@/hooks/usePoolStats";

const BASE_URL = "https://data.sifchain.finance";

export type RewardsProgramConfig = {
  start_height: number;
  end_height: number | null;
  start_date_utc: string;
  end_date_utc: string | null;
  /**
   * comma separated list of token denoms
   */
  tokens: string;
};

export type RewardsProgramsReponse = {
  Rewards: {
    reward_program: string;
    config: RewardsProgramConfig;
    last_updated: string;
    comment: string;
    preflight_on: boolean;
  }[];
};

export type UserRewardsSummaryResponse = {
  totalClaimableCommissionsAndClaimableRewards: number;
  maturityDateMs: string;
  yearsToMaturity: number;
  totalDepositedAmount: number;
  currentTotalCommissionsOnClaimableDelegatorRewards: number;
  claimedCommissionsAndRewardsAwaitingDispensation: number;
  dispensed: number;
  totalCommissionsAndRewardsAtMaturity: number;
}[];

const fetchJSON = <T>(endpoint: string, options: RequestInit = {}) =>
  fetch(endpoint, {
    ...options,
    headers: {
      ...options.headers,
      "Content-Type": "application/json",
    },
  }).then((x) => x.json() as Promise<T>);

export default class DataService {
  constructor(private baseUrl: string = BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async getTokenStats() {
    const res = await fetchJSON<PoolStatsResponseData>(
      `${this.baseUrl}/beta/asset/tokenStats`,
    );
    return res;
  }

  async getRewardsPrograms() {
    const res = await fetchJSON<{ rewardPrograms: RewardsProgramsReponse[] }>(
      `${this.baseUrl}/beta/asset/rewardPrograms`,
    );
    return res.rewardPrograms;
  }

  async getUserRewards(address: string) {
    const res = await fetchJSON<{ rewardPrograms: RewardsProgramsReponse[] }>(
      `${this.baseUrl}/beta/network/rewardconfig/${address}`,
    );
    return res.rewardPrograms;
  }
}
