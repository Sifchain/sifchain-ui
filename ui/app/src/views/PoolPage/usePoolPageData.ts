import { computed, toRefs } from "@vue/reactivity";
import { useCore } from "@/hooks/useCore";
import { defineComponent, ref } from "vue";
import { LiquidityProvider, Pool } from "@sifchain/sdk";
import { useAsyncData } from "@/hooks/useAsyncData";
import { usePoolStats } from "@/hooks/usePoolStats";
import { accountStore } from "@/store/modules/accounts";
export type PoolPageAccountPool = { lp: LiquidityProvider; pool: Pool };

export type PoolPageData = ReturnType<typeof usePoolPageData>;

export type PoolPageColumnId =
  | "token"
  | "apy"
  | "gainLoss"
  | "share"
  | "reward-apy";
export const COLUMNS: {
  id: PoolPageColumnId;
  name: string;
  class: string;
  sortable?: boolean;
}[] = [
  {
    id: "token",
    name: "Token Pair",
    class: "w-[233px] text-left justify-start",
    sortable: true,
  },
  {
    id: "apy",
    name: "Pool APY",
    class: "w-[138px] text-right justify-end",
    sortable: true,
  },
  {
    id: "reward-apy",
    name: "Reward APY",
    class: "w-[138px] text-right justify-end",
    sortable: true,
  },
  {
    id: "share",
    name: "Your Pool Share",
    class: "w-[152px] text-right justify-end",
  },
];

export const usePoolPageData = () => {
  const { store } = useCore();

  const selectedPool = ref<PoolPageAccountPool | null>(null);

  const stats = usePoolStats();

  // TODO: Sort pools?
  const accountPools = computed(() => {
    if (
      !store.accountpools ||
      !accountStore.state.sifchain.address ||
      !store.accountpools[accountStore.state.sifchain.address]
    ) {
      return [];
    }
    return Object.entries(
      store.accountpools[accountStore.state.sifchain.address] ?? {},
    ).map(([poolName, accountPool]) => {
      return {
        ...accountPool,
        pool: store.pools[poolName],
      } as PoolPageAccountPool;
    });
  });

  return {
    accountPools,
    selectedPool,
    stats,
  };
};
