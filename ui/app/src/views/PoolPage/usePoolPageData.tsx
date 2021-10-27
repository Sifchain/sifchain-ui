import { computed, toRefs } from "@vue/reactivity";
import { onUnmounted, watch } from "vue";
import { useCore } from "@/hooks/useCore";
import { defineComponent, onMounted, ref } from "vue";
import { createPoolKey, LiquidityProvider, Network, Pool } from "@sifchain/sdk";
import { useAsyncData } from "@/hooks/useAsyncData";
import { PoolStat, usePoolStats } from "@/hooks/usePoolStats";
import { accountStore } from "@/store/modules/accounts";
import { AccountPool } from "@sifchain/sdk/src/store/pools";
import { useChains } from "@/hooks/useChains";
import { useAsyncDataCached } from "@/hooks/useAsyncDataCached";
import {
  useUserPoolsSubscriber,
  usePublicPoolsSubscriber,
} from "@/hooks/usePoolsSubscriber";
import { createCryptoeconGqlClient } from "@/utils/createCryptoeconGqlClient";
import { RewardProgram } from "../RewardsPage/useRewardsPageData";
export type PoolPageAccountPool = { lp: LiquidityProvider; pool: Pool };

export type PoolPageData = ReturnType<typeof usePoolPageData>;

export type PoolPageColumnId =
  | "token"
  | "gainLoss"
  | "userShare"
  | "userValue"
  | "totalAPY";

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
    id: "totalAPY",
    name: "Estimated Total APY",
    class: "w-[260px] text-right justify-end",
    sortable: true,
    help: (
      <div>
        'Estimated Total APY' is a sum of the "Pool APY" from swap fees and the
        "Reward APY" from Sifchain reward programs.
        <br />
        <br />
        "Pool APY" is calculated as: <br />
        <span class="font-mono">24hour_trading_volume / pool_depth</span>
        <br /> for each pool. It only estimates the fee revenue paid to pool, so
        it should be taken as an approximation. The estimate may be thrown off
        by irregular trading activity during trading competitions.
      </div>
    ),
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
