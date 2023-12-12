import { reactive, computed, onMounted, onUnmounted } from "vue";
import { Asset } from "@sifchain/sdk";

import { PoolStat, usePoolStats } from "~/hooks/usePoolStats";
import { useCore } from "~/hooks/useCore";
import { isAssetFlaggedDisabled } from "~/store/modules/flags";

export type StatsPageState = {
  sortBy:
    | "asset"
    | "price"
    | "tvl"
    | "volume"
    | "arbitrage"
    | "rowanApr"
    | "pairedApr"
    | "marginApr";
  sortDirection: "asc" | "desc";
};

export function useStatsPageData(initialState: StatsPageState) {
  const state = reactive<StatsPageState>(initialState);
  const res = usePoolStats();

  let unsubscribe: () => void;
  onMounted(() => {
    unsubscribe = useCore().usecases.clp.subscribeToPublicPools();
  });
  onUnmounted(() => {
    unsubscribe?.();
  });

  const statsRef = computed(() => {
    if (!res.data.value) return [];
    const { poolData } = res.data.value;
    const pools = poolData.pools as Record<string, PoolStat>;
    const array = Object.entries(pools)
      .map(([key, pool]) => {
        const asset = Asset.get(pool.symbol);
        const item = {
          asset,
          price: pool.priceToken,
          tvl: pool.poolTVL,
          volume: pool.volume ?? 0,
          arbitrage: pool.arb == null ? null : pool.arb ?? 0,
          pairedApr: Number(pool.pairedApr).toFixed(1),
          rewardApr: Number(pool.rewardApr).toFixed(2),
          marginApr: pool.margin_apr,
        };

        return item;
      })
      .filter(
        ({ asset }) => !asset.decommissioned && !isAssetFlaggedDisabled(asset),
      )
      .sort((a, b) => {
        if (state.sortBy === "asset") {
          return (a.asset.displaySymbol || a.asset.symbol).localeCompare(
            b.asset.displaySymbol || b.asset.symbol,
          );
        }
        return Number(a[state.sortBy] || "0") - Number(b[state.sortBy] || "0");
      });

    if (state.sortDirection === "desc") {
      array.reverse();
    }
    return array;
  });

  return {
    state,
    res,
    statsRef,
  };
}
