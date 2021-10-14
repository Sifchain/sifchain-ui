import { reactive, computed, onMounted, onUnmounted } from "vue";
import { Asset, IAsset } from "@sifchain/sdk";
import { usePoolStats } from "@/hooks/usePoolStats";
import { useCore } from "@/hooks/useCore";

export type StatsItem = {
  asset: IAsset;
  price: number;
  depth: number;
  volume: number;
  arbitrage: number;
  poolApy: number;
  miningBonus: number;
  totalApy: number;
  rewardApy: number;
};

export type StatsPageState = {
  sortBy:
    | "asset"
    | "price"
    | "depth"
    | "volume"
    | "arbitrage"
    | "poolApy"
    | "rewardApy"
    | "totalApy";
  sortDirection: "asc" | "desc";
};

export function useStatsPageData(initialState: StatsPageState) {
  const state = reactive<StatsPageState>(initialState);
  const res = usePoolStats();

  let unsubscribe: () => void;
  onMounted(() => {
    unsubscribe = useCore().usecases.clp.subscribeToPublicPools().unsubscribe;
  });
  onUnmounted(() => {
    unsubscribe?.();
  });

  const statsRef = computed(() => {
    if (!res.data.value) return [];
    const { liqAPY, poolData, cryptoeconSummaryAPY } = res.data.value;

    const array = poolData.pools
      .map((pool) => {
        const asset = Asset.get(pool.symbol);
        const item = {
          asset,
          price: parseFloat(pool.priceToken),
          depth: parseFloat(pool.poolDepth),
          volume: parseFloat(pool.volume) || 0,
          arbitrage: pool.arb == null ? null : parseFloat(pool.arb) || 0,
          poolApy: pool.poolAPY,
          rewardApy: pool.rewardAPY,
          totalApy: pool.totalAPY,
        };

        return item;
      })
      .filter((item) => !item.asset.decommissioned)
      .sort((a, b) => {
        if (state.sortBy === "asset") {
          return (a.asset.displaySymbol || a.asset.symbol).localeCompare(
            b.asset.displaySymbol || b.asset.symbol,
          );
        }
        return +a[state.sortBy] - +b[state.sortBy];
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
