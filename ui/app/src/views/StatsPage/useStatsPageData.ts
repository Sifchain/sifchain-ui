import { reactive, computed } from "vue";
import { Asset, IAsset } from "@sifchain/sdk";
import { usePoolStats } from "@/hooks/usePoolStats";

export type StatsItem = {
  asset: IAsset;
  price: number;
  depth: number;
  volume: number;
  arbitrage: number;
  poolApy: number;
  miningBonus: number;
  totalApy: number;
};

export type StatsPageState = {
  sortBy: "asset" | "price" | "depth" | "volume" | "arbitrage" | "poolApy";
  sortDirection: "asc" | "desc";
};

export function useStatsPageData(initialState: StatsPageState) {
  const state = reactive<StatsPageState>(initialState);
  const res = usePoolStats();

  const statsRef = computed<StatsItem[]>(() => {
    if (!res.data.value) return [];
    const { liqAPY, poolData } = res.data.value;

    const array = poolData.pools
      .map((pool) => {
        const asset = Asset.get(pool.symbol);
        const item: any = {
          asset,
          price: parseFloat(pool.priceToken),
          depth: parseFloat(pool.poolDepth),
          volume: parseFloat(pool.volume) || 0,
          arbitrage: parseFloat(pool.arb) || 0,
        };
        item.poolApy = (item.volume / item.depth) * 100;

        return item as StatsItem;
      })
      .sort((a: StatsItem, b: StatsItem) => {
        if (state.sortBy === "asset") {
          return (a.asset.displaySymbol || a.asset.symbol).localeCompare(
            b.asset.displaySymbol || b.asset.symbol,
          );
        }
        return a[state.sortBy] - b[state.sortBy];
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
