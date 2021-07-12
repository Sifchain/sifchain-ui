import { computed, toRefs } from "@vue/reactivity";
import { useCore } from "@/hooks/useCore";
import { defineComponent, ref } from "vue";
import { LiquidityProvider, Pool } from "@sifchain/sdk";
import { useAsyncData } from "@/hooks/useAsyncData";
import { usePoolStats } from "@/hooks/usePoolStats";
export type PoolPageAccountPool = { lp: LiquidityProvider; pool: Pool };

export type PoolPageData = ReturnType<typeof usePoolPageData>;

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
      console.log("leaving pools");
      return [];
    }
    console.log("rtning pools");
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
