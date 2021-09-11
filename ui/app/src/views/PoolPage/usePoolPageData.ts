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
      "This is your estimated pool value in USDT assuming you remove your liquidity equally across both tokens. This number does not take into consideration any projected or earned rewards.",
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
  const { store, usecases, poolFinder, accountPoolFinder } = useCore();

  const selectedPool = ref<PoolPageAccountPool | null>(null);

  const stats = usePoolStats();

  const isUserDataLoaded = ref(false);
  const isPoolsDataLoaded = ref(false);
  let unsubscribePublic: () => void;
  let unsubscribeUser: () => void;

  const subscribeUser = async () => {
    const userRes = usecases.clp.subscribeToUserPools(
      accountStore.state.sifchain.address,
    );
    unsubscribeUser = userRes.unsubscribe;
    await userRes.initPromise;
    isUserDataLoaded.value = true;
  };

  onMounted(async () => {
    subscribeUser();
    const poolsRes = usecases.clp.subscribeToPublicPools();
    unsubscribePublic = poolsRes.unsubscribe;
    await poolsRes.initPromise;
    isPoolsDataLoaded.value = true;
  });

  watch(
    accountStore.state.sifchain,
    async (prev, curr) => {
      unsubscribeUser?.();
      subscribeUser();
    },
    {
      deep: true,
    },
  );

  onUnmounted(() => {
    unsubscribePublic?.();
    unsubscribeUser?.();
  });

  const allPoolsData = computed<PoolDataItem[]>(() => {
    const sifchainChain = useChains().get(Network.SIFCHAIN);
    return (stats.data?.value?.poolData?.pools || []).map((poolStat) => {
      const poolKey = createPoolKey(
        sifchainChain.lookupAssetOrThrow("rowan"),
        sifchainChain.lookupAssetOrThrow(poolStat.symbol),
      );
      let accountPool: AccountPool | undefined = undefined;
      if (accountStore.state.sifchain.address) {
        accountPool =
          store.accountpools[accountStore.state.sifchain.address][poolKey];
      }
      const item = {
        poolStat,
        pool: store.pools[poolKey],
        accountPool,
      };
      return item;
    });
  });

  return {
    isLoaded: computed(() => {
      const hasPotentialAccount =
        accountStore.state.sifchain.connecting ||
        accountStore.state.sifchain.connected;
      // Show pools page as loaded if user is not connected and main data loads
      return (
        isPoolsDataLoaded.value &&
        allPoolsData.value.length > 0 &&
        (!hasPotentialAccount || isUserDataLoaded.value)
      );
    }),
    allPoolsData,
  };
};
