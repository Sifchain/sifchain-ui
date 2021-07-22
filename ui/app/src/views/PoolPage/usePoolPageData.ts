import { computed, toRefs } from "@vue/reactivity";
import { useCore } from "@/hooks/useCore";
import { defineComponent, ref } from "vue";
import { LiquidityProvider, Pool } from "@sifchain/sdk";
import { useAsyncData } from "@/hooks/useAsyncData";
import { usePoolStats } from "@/hooks/usePoolStats";
export type PoolPageAccountPool = { lp: LiquidityProvider; pool: Pool };

export type PoolPageData = ReturnType<typeof usePoolPageData>;

type PoolPageColumnId = "token" | "apy" | "gainLoss" | "share";
export const COLUMNS: {
  id: PoolPageColumnId;
  name: string;
  class: string;
}[] = [
  {
    id: "token",
    name: "Token Pair",
    class: "w-[233px] text-left justify-start",
  },
  {
    id: "apy",
    name: "Pool APY",
    class: "w-[128px] text-right justify-end",
  },
  {
    id: "gainLoss",
    name: "Gain/Loss",
    class: "w-[140px] text-right justify-end",
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
      !store.wallet.sif.address ||
      !store.accountpools[store.wallet.sif.address]
    ) {
      return [];
    }
    return Object.entries(
      store.accountpools[store.wallet.sif.address] ?? {},
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
