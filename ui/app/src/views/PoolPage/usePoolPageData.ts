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
export type PoolPageAccountPool = { lp: LiquidityProvider; pool: Pool };

export type PoolPageData = ReturnType<typeof usePoolPageData>;

export type PoolPageColumnId =
  | "token"
  | "apy"
  | "gainLoss"
  | "rewardApy"
  | "userShare"
  | "userValue";

export type PoolPageColumn = {
  id: PoolPageColumnId;
  name: string;
  class: string;
  help?: string;
  sortable?: boolean;
};
export const COLUMNS: PoolPageColumn[] = [
  {
    id: "token",
    name: "Token Pair",
    class: "w-[230px] text-left justify-start",
    sortable: true,
  },
  {
    id: "apy",
    name: "Pool APY",
    class: "w-[138px] text-right justify-end",
    sortable: true,
  },
  {
    id: "rewardApy",
    name: "Reward APY",
    class: "w-[138px] text-right justify-end",
    sortable: true,
  },
  {
    id: "userShare",
    name: "Your Pool Share",
    class: "w-[138px] text-right justify-end",
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
