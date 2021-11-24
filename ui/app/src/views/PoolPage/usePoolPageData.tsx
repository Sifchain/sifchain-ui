import { useAsyncData } from "@/hooks/useAsyncData";
import { useAsyncDataCached } from "@/hooks/useAsyncDataCached";
import { useChains } from "@/hooks/useChains";
import { useCore } from "@/hooks/useCore";
import {
  usePublicPoolsSubscriber,
  useUserPoolsSubscriber,
} from "@/hooks/usePoolsSubscriber";
import { PoolStat, usePoolStats } from "@/hooks/usePoolStats";
import { accountStore } from "@/store/modules/accounts";
import { createCryptoeconGqlClient } from "@/utils/createCryptoeconGqlClient";
import { createPoolKey, LiquidityProvider, Network, Pool } from "@sifchain/sdk";
import { AccountPool } from "@sifchain/sdk/src/store/pools";
import { computed } from "@vue/reactivity";
import { RewardProgram } from "../RewardsPage/useRewardsPageData";
export type PoolPageAccountPool = { lp: LiquidityProvider; pool: Pool };

export type PoolPageData = ReturnType<typeof usePoolPageData>;

export type PoolPageColumnId =
  | "token"
  | "gainLoss"
  | "userShare"
  | "userValue"
  | "poolAPY"
  | "rewardAPY";

export type PoolRewardProgram = Pick<
  RewardProgram,
  | "isUniversal"
  | "summaryAPY"
  | "description"
  | "rewardProgramName"
  | "displayName"
  | "incentivizedPoolSymbols"
  | "startDateTimeISO"
  | "endDateTimeISO"
>;

export type PoolPageColumn = {
  id: PoolPageColumnId;
  name: string;
  class: string;
  help?: string | JSX.Element;
  sortable?: boolean;
};
export const COLUMNS: PoolPageColumn[] = [
  {
    id: "token",
    name: "Token Pair",
    class: "w-[260px] text-left justify-start",
    sortable: true,
  },
  {
    id: "poolAPY",
    name: "Pool APR",
    class: "w-[130px] text-right justify-end",
    sortable: true,
    help: (
      <div>
        Pool APR is an estimate of trading fees generated from this pool, and is
        calculated as{" "}
        <span class="font-mono">24hour_trading_volume / pool_depth</span> for
        each pool.
      </div>
    ),
  },
  {
    id: "rewardAPY",
    name: "Reward APR",
    class: "w-[130px] text-right justify-end",
    sortable: true,
  },
  {
    id: "userShare",
    name: "Your Pool Share",
    class: "w-[128px] text-right justify-end",
  },
  {
    id: "userValue",
    name: "Your Pool Value",
    help:
      "This is your estimated pool value in USD assuming you remove your liquidity equally across both tokens. This number does not take into consideration any projected or earned rewards.",
    class: "w-[168px] text-right justify-end",
  },
];

export const COLUMNS_LOOKUP = COLUMNS.reduce((acc, col) => {
  acc[col.id] = col;
  return acc;
}, {} as Record<PoolPageColumnId, PoolPageColumn>);

// Only wait for load on first visit of the page
export type PoolDataItem = {
  pool: Pool;
  poolStat?: PoolStat;
  accountPool?: AccountPool;
};

export const usePoolPageData = () => {
  const statsRes = usePoolStats();

  useUserPoolsSubscriber({});
  usePublicPoolsSubscriber({});

  const userPoolsRes = useAsyncDataCached(
    "userPoolsData",
    async () => {
      const address = accountStore.state.sifchain.address;
      if (!address) return;
      return useCore().usecases.clp.syncPools.syncUserPools(address);
    },
    [accountStore.refs.sifchain.connected.computed()],
  );

  const gql = createCryptoeconGqlClient();
  const rewardProgramsRes = useAsyncData(
    (): Promise<{
      rewardPrograms: PoolRewardProgram[];
    }> => {
      return gql`
        query {
          rewardPrograms {
            isUniversal
            summaryAPY
            rewardProgramName
            displayName
            incentivizedPoolSymbols
            description
            startDateTimeISO
            endDateTimeISO
          }
        }
      `;
    },
  );

  const allPoolsData = computed<PoolDataItem[]>(() => {
    const sifchainChain = useChains().get(Network.SIFCHAIN);
    return (statsRes.data?.value?.poolData?.pools || []).map((poolStat) => {
      const poolKey = createPoolKey(
        sifchainChain.lookupAssetOrThrow("rowan"),
        sifchainChain.lookupAssetOrThrow(poolStat.symbol),
      );
      let accountPool: AccountPool | undefined = undefined;
      if (accountStore.state.sifchain.address) {
        accountPool = useCore().store.accountpools[
          accountStore.state.sifchain.address
        ][poolKey];
      }
      const item = {
        poolStat,
        pool: useCore().store.pools[poolKey],
        accountPool,
      };
      return item;
    });
  });

  return {
    rewardProgramsRes,
    poolStatLookup: statsRes.poolStatLookup,
    isLoaded: computed(() => {
      return (
        !statsRes.isLoading.value &&
        !userPoolsRes.isLoading.value &&
        allPoolsData.value.length > 0 &&
        !accountStore.state.sifchain.connecting
      );
    }),
    allPoolsData,
  };
};
