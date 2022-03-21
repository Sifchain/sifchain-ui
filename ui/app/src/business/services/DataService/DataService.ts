import groupBy from "lodash/groupBy";

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
  reward_program: string;
  pool: string;
  net_liquidity_bal: number;
  total_liquidity_bal: number;
  net_percentage: number;
  reward_allocation: number;
  pool_unit: string;
  total_pool: string;
  perc_pool: number;
  pool_balance: string;
  pool_balance_native: string;
  pool_balance_external: string;
  network_pool_native: string;
  network_pool_external: string;
  reward_dispensed_total: string;
  pending_rewards: string;
  next_remaining_time_to_dispense: string;
};

type ProgramConfigMap = Record<
  string,
  {
    displayName: string;
    description: string;
    documentationURL: string;
    summaryAPY: number;
  }
>;

export const REWARDS_PROGRAMS_CONFIG: ProgramConfigMap = {
  harvest_expansion: {
    displayName: "Sif's Expansion",
    description: "100% APR. All pools.",
    documentationURL:
      "https://docs.sifchain.finance/using-the-website/web-ui-step-by-step/rewards/liquidity-mining-rewards-programs",
    summaryAPY: 100,
  },
  expansion_v4_bonus: {
    displayName: "Pools of the People (v4)",
    description:
      "300% total APR (Expansion included). 7 pools. Selected by the community.",
    documentationURL:
      "https://docs.sifchain.finance/using-the-website/web-ui-step-by-step/rewards/liquidity-mining-rewards-programs",
    summaryAPY: 200,
  },
};

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
        `${this.baseUrl}/beta/network/rewardconfig/all`,
      );

      const raw = res.Rewards;

      const sorted = raw
        .filter((x) => !x.config.end_height)
        .sort(
          (a, b) => (a.config.end_height || 0) - (b.config.end_height || 0),
        );

      return sorted.map((program) => {
        const isUniversal = program.config.tokens === "ALL";

        const config = REWARDS_PROGRAMS_CONFIG[program.reward_program];

        return {
          isUniversal,
          rewardProgramName: program.reward_program,
          startDateTimeISO: program.config.start_date_utc,
          endDateTimeISO: program.config.end_date_utc,
          incentivizedPoolSymbols: isUniversal
            ? ["*"]
            : program.config.tokens.split(",").map((x) => x.trim()),
          ...(config || {}),
        };
      });
    } catch (error) {
      return [];
    }
  }

  async getUserRewards(address: string) {
    try {
      const { Rewards } = await fetchJSON<{
        Rewards: UserRewardsSummaryResponse[];
      }>(`${this.baseUrl}/beta/network/rewardPay/${address}`);

      const groups = groupBy(Rewards, (x) => x.reward_program);

      return Object.keys(groups).reduce(
        (acc, groupName) => {
          const group: UserRewardsSummaryResponse[] = groups[groupName];

          const uniquePendingRewards = [
            ...new Set(group.map((x) => Number(x.pending_rewards))),
          ];

          const uniqueDispensedTotals = [
            ...new Set(group.map((x) => Number(x.reward_dispensed_total))),
          ];

          return {
            ...acc,
            [groupName]: {
              totalClaimableCommissionsAndClaimableRewards:
                group[0].reward_allocation,
              claimedCommissionsAndRewardsAwaitingDispensation:
                uniquePendingRewards.reduce((acc, x) => acc + x, 0),
              dispensed: uniqueDispensedTotals.reduce((acc, x) => acc + x, 0),
              pools: group,
            },
          };
        },
        {} as Record<
          string,
          {
            totalClaimableCommissionsAndClaimableRewards: number;
            claimedCommissionsAndRewardsAwaitingDispensation: number;
            dispensed: number;
          }
        >,
      );
    } catch (error) {
      return {} as Record<
        string,
        {
          totalClaimableCommissionsAndClaimableRewards: number;
          claimedCommissionsAndRewardsAwaitingDispensation: number;
          dispensed: number;
        }
      >;
    }
  }
}
