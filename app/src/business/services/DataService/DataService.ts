import groupBy from "lodash/groupBy";
import uniq from "lodash/fp/uniq";

import { PoolStatsResponseData } from "@/hooks/usePoolStats";

export const BASE_URL = "https://data.sifchain.finance";

export type RewardsProgramConfig = {
  start_height: number;
  end_height: number | null;
  start_date_utc: string;
  end_date_utc: string | null;
  /**
   * comma separated list of token denoms
   */
  tokens: string[];
  symbol: string[];
};

export type RewardsProgram = {
  reward_program: string;
  last_updated: string;
  comment: string;
  preflight_on: boolean;
  config: RewardsProgramConfig;
};

export type RewardProgramsResponse = {
  Rewards: RewardsProgram[];
};

export type UserRewardsSummary = {
  reward_program: string;
  pool: string;
  token: string;
  net_liquidity_bal: number;
  reward_dispensed_total: string;
  next_remaining_time_to_dispense: string;
  dispensed_rewards: string;
  pending_rewards: string;
  rowan_cusdt: string;
  updated_time_gmt: string;
};

export type UserRewardsResponse = {
  Rewards: UserRewardsSummary[];
};

export type RewardProgramUserRewards = {
  accumulatedRewards: number;
  pendingRewards: number;
  dispensed: number;
};

export type UserRewards = {
  programs: Record<string, RewardProgramUserRewards>;
  timeRemaining: string;
  totalDispensed: number;
  totalPending: number;
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

const MINUTE = 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;

/**
 * formats time in seconds to DDd HHh MMm
 * @param seconds time in seconds
 * @returns
 */
function formatTimeInSeconds(seconds = 0) {
  const days = Math.floor(seconds / DAY);
  const remainderFromDays = seconds % DAY;
  const hours = Math.floor(remainderFromDays / HOUR);
  // const minutes = Math.floor((seconds % HOUR) / MINUTE);

  const qualifiers = ["d", "h"];

  return [days, hours]
    .map((value, index) => `${value}${qualifiers[index]}`)
    .join(" ");
}

const fetchJSON = <T>(endpoint: string, options: RequestInit = {}) =>
  fetch(endpoint, options).then((x) => x.json() as Promise<T>);

type CacheEntry<T> = {
  value: T;
  expires: number;
};

const CACHE = new Map<string, CacheEntry<any>>();

async function cached<T>(
  key: string | string[],
  fn: () => Promise<T>,
  ttl = 1000,
) {
  const flatKey = Array.isArray(key) ? key.join("-") : key;
  const cached = CACHE.get(flatKey);

  if (cached && cached.expires > Date.now()) {
    return Promise.resolve(cached.value as T);
  }

  const value = await fn();
  CACHE.set(flatKey, { value, expires: Date.now() + ttl });
  return value;
}

export default class DataService {
  constructor(private baseUrl: string = BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async getTokenStats() {
    try {
      const res = await cached(
        "tokenStats",
        () =>
          fetchJSON<PoolStatsResponseData>(
            `${this.baseUrl}/beta/asset/tokenStats`,
          ),
        60000 * 5, // cache for 5 minutes
      );
      return res;
    } catch (error) {
      return {} as PoolStatsResponseData;
    }
  }

  async getTokenStatsPMTP() {
    try {
      const res = await cached(
        "tokenStats",
        () =>
          fetchJSON<PoolStatsResponseData>(
            `${this.baseUrl}/beta/asset/tokenStatsPMTP`,
          ),
        60000 * 5, // cache for 5 minutes
      );
      const { pools } = res.body;
      return {
        ...res,
        body: {
          ...res.body,
          pools: pools.map((x) => ({
            ...x,
            poolApr: (x.poolApr ?? 0) * 100,
          })),
        },
      };
    } catch (error) {
      return {} as PoolStatsResponseData;
    }
  }

  async getRewardsPrograms() {
    try {
      const { Rewards } = await cached(
        "rewardsPrograms",
        () =>
          fetchJSON<RewardProgramsResponse>(
            `${this.baseUrl}/beta/network/rewardconfig/all`,
          ),
        60000 * 60, // cache for 1 hour
      );

      const sorted = Rewards.filter((x) => !x.config.end_height).sort(
        (a, b) => (a.config.end_height || 0) - (b.config.end_height || 0),
      );

      return sorted.map((program) => {
        const isUniversal = program.config.tokens[0] === "ALL";

        return {
          isUniversal,
          rewardProgramName: program.reward_program,
          startDateTimeISO: program.config.start_date_utc,
          endDateTimeISO: program.config.end_date_utc,
          incentivizedPoolSymbols: isUniversal ? ["*"] : program.config.symbol,
        };
      });
    } catch (error) {
      return [];
    }
  }

  async getUserRewards(address: string): Promise<UserRewards> {
    try {
      const { Rewards } = await cached(
        ["userRewards", address],
        () =>
          fetchJSON<UserRewardsResponse>(
            `${this.baseUrl}/beta/network/rewardPay/${address}`,
          ),
        60000 * 5, // cache for 5 minute
      );

      const groups = groupBy(Rewards, (x) => x.reward_program);

      let timeToNextDispensation = "";
      let totalDispensed = 0;

      const programs = Object.keys(groups).reduce((acc, groupName) => {
        const group: UserRewardsSummary[] = groups[groupName];

        if (!timeToNextDispensation) {
          timeToNextDispensation = formatTimeInSeconds(
            Math.floor(Number(group[0].next_remaining_time_to_dispense)),
          );
        }

        if (!totalDispensed) {
          const rewardDispensedTotals = uniq(
            group.map((x) => Number(x.reward_dispensed_total)),
          );
          totalDispensed = rewardDispensedTotals[0];
        }

        const pendingRewards = uniq(
          group.map((x) => Number(x.pending_rewards)),
        );

        const dispensedRewardsPerProgram = uniq(
          group.map((x) => Number(x.dispensed_rewards)),
        );

        const totalPendingRewards = pendingRewards.reduce(
          (acc, x) => acc + x,
          0,
        );

        return {
          ...acc,
          [groupName]: {
            accumulatedRewards: totalPendingRewards,
            pendingRewards: totalPendingRewards,
            dispensed: dispensedRewardsPerProgram[0],
          },
        };
      }, {} as Record<string, RewardProgramUserRewards>);

      return {
        programs,
        timeRemaining: timeToNextDispensation,
        totalDispensed,
        totalPending: 0,
      };
    } catch (error) {
      return {
        programs: {},
        timeRemaining: "",
        totalDispensed: 0,
        totalPending: 0,
      };
    }
  }
}
