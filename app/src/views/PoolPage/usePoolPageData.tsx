import { computed } from "@vue/reactivity";
import { useCore } from "@/hooks/useCore";
import { createPoolKey, LiquidityProvider, Network, Pool } from "@sifchain/sdk";
import { useAsyncData } from "@/hooks/useAsyncData";
import { PoolStat, usePoolStats } from "@/hooks/usePoolStats";
import { accountStore } from "@/store/modules/accounts";

import { useChains } from "@/hooks/useChains";
import { useAsyncDataCached } from "@/hooks/useAsyncDataCached";
import {
  useUserPoolsSubscriber,
  usePublicPoolsSubscriber,
} from "@/hooks/usePoolsSubscriber";

import { RewardProgram } from "../RewardsPage/useRewardsPageData";
import { AccountPool } from "@/business/store/pools";
export type PoolPageAccountPool = { lp: LiquidityProvider; pool: Pool };

export type PoolPageData = ReturnType<typeof usePoolPageData>;

export type PoolPageColumnId =
  | "token"
  | "apy"
  | "gainLoss"
  | "rewardApy"
  | "userShare"
  | "userValue";

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
    id: "apy",
    name: "Pool APY",
    class: "w-[128px] text-right justify-end",
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
    id: "rewardApy",
    name: "Reward APR (APY)",
    class: "w-[150px] text-right justify-end",
    sortable: true,
    help: (
      <div>
        The Reward APY is calculated as the rate of return from the given reward
        APR, compounded weekly.
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
    help: "This is your estimated pool value in USD assuming you remove your liquidity equally across both tokens. This number does not take into consideration any projected or earned rewards.",
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
  const { services } = useCore();

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

  const rewardProgramsRes = useAsyncData(() =>
    services.data.getRewardsPrograms(),
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
        accountPool =
          useCore().store.accountpools[accountStore.state.sifchain.address][
            poolKey
          ];
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
