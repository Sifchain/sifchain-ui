import { reactive, computed, onMounted, onUnmounted } from "vue";
import { Asset, IAsset } from "@sifchain/sdk";
import { usePoolStats } from "@/hooks/usePoolStats";
import { useCore } from "@/hooks/useCore";
import { isAssetFlaggedDisabled } from "@/store/modules/flags";

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
    unsubscribe = useCore().usecases.clp.subscribeToPublicPools();
  });
  onUnmounted(() => {
    unsubscribe?.();
  });

  const statsRef = computed(() => {
    if (!res.data.value) return [];
    const { liqAPY, poolData } = res.data.value;

    const array = poolData.pools
      .map((pool) => {
        const asset = Asset.get(pool.symbol);
        const item = {
          asset,
          price: parseFloat(pool.priceToken),
          depth: parseFloat(pool.poolDepth),
          volume: parseFloat(pool.volume) || 0,
          arbitrage: pool.arb == null ? null : parseFloat(pool.arb) || 0,
          // NOTE(ajoslin): poolAPY is currently using a naive formula that is quite wrong when
          // swappers are doing masses of minimum-size trades. It way over-estimates how many
          // fees are paid out.
          // As a "stupid hack" until this is fixed, we are dividing poolAPY
          // Search for: stupid-poolapy-hack
          poolApy: +pool.poolAPY > 150 ? +pool.poolAPY / 10 : +pool.poolAPY,
          rewardApy: pool.rewardAPY,
          totalApy: pool.totalAPY,
        };

        return item;
      })
      .filter((item) => {
        return (
          !item.asset.decommissioned && !isAssetFlaggedDisabled(item.asset)
        );
      })
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
