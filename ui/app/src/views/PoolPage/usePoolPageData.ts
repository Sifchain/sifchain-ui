import { computed, toRefs } from "@vue/reactivity";
import { useCore } from "@/hooks/useCore";
import { defineComponent, ref } from "vue";
import { LiquidityProvider, Pool } from "@sifchain/sdk";
type AccountPool = { lp: LiquidityProvider; pool: Pool };

export const usePoolPageData = () => {
  const { store } = useCore();

  const selectedPool = ref<AccountPool | null>(null);

  // TODO: Sort pools?
  const accountPools = computed(() => {
    if (
      !store.accountpools ||
      !store.wallet.sif.address ||
      !store.accountpools[store.wallet.sif.address]
    )
      return [];

    return Object.entries(
      store.accountpools[store.wallet.sif.address] ?? {},
    ).map(([poolName, accountPool]) => {
      return {
        ...accountPool,
        pool: store.pools[poolName],
      } as AccountPool;
    });
  });

  return {
    accountPools,
    selectedPool,
  };
};
