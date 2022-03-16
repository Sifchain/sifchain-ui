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

export type RewardsProgram = {
  reward_program: string;
  last_updated: string;
  comment: string;
  preflight_on: boolean;
  config: RewardsProgramConfig;
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
  fetch(endpoint, options).then((x) => x.json() as Promise<T>);

export default class DataService {
  constructor(private baseUrl: string = BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async getTokenStats() {
    try {
      const res = await fetchJSON<PoolStatsResponseData>(
        `${this.baseUrl}/beta/asset/tokenStats`,
      );
      return res;
    } catch (error) {
      return {} as PoolStatsResponseData;
    }
  }

  async getRewardsPrograms() {
    try {
      const res = await fetchJSON<{ Rewards: RewardsProgram[] }>(
        `${this.baseUrl}/beta/rewardconfig/all`,
      );

      console.log({ res });

      return res.Rewards;
    } catch (error) {
      return [] as RewardsProgram[];
    }
  }

  async getUserRewards(address: string) {
    try {
      const res = await fetchJSON<{ Rewards: RewardsProgram[] }>(
        `${this.baseUrl}/beta/network/rewardconfig/${address}`,
      );
      return res.Rewards;
    } catch (error) {
      return [] as RewardsProgram[];
    }
  }
}
