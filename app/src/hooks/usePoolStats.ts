import { flagsStore, isAssetFlaggedDisabled } from "@/store/modules/flags";
import { symbolWithoutPrefix } from "@/utils/symbol";
import { IAsset } from "@sifchain/sdk";
import { computed } from "vue";
import { useQuery } from "vue-query";
import { useNativeChain } from "./useChains";
import { useCore } from "./useCore";

export interface PoolStatsResponseData {
  statusCode: number;
  headers: Headers;
  body: Body;
}

interface Body {
  liqAPY: string;
  rowanUSD: string;
  pools: PoolStat[];
}

export interface PoolStat {
  symbol: string;
  priceToken: number;
  rowanUSD: number;
  poolDepth: number;
  poolTVL: number;
  volume: number;
  arb: number;
  dailySwapFees: number;
  poolBalance: number;
  accruedNumSecsRewards: number;
  rewardPeriodNativeDistributed: number;
  secsPerYear: number;
  tradingApr: number;
  rewardApr: number;
  poolApr: number;
}

export interface Headers {
  "Access-Control-Allow-Origin": string;
}

const hasLoggedError: Record<string, boolean> = {};

export function useDataServicesPoolStats() {
  const { services } = useCore();

  const isPMTPEnabled = flagsStore.state.pmtp;

  return useQuery(
    ["pool-stats", isPMTPEnabled],
    () =>
      isPMTPEnabled
        ? services.data.getTokenStatsPMTP()
        : services.data.getTokenStats(),
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 5 * 60 * 1000,
      retry: true,
    },
  );
}

export function usePoolStats() {
  const { store } = useCore();

  const isPMTPEnabled = flagsStore.state.pmtp;

  const poolStatsQuery = useDataServicesPoolStats();

  const poolStatsRes = useQuery(
    ["poolStats", isPMTPEnabled],
    async () => {
      if (!poolStatsQuery.data.value) {
        return;
      }
      const { body: poolData } = poolStatsQuery.data.value;

      const response = {
        poolData,
        liqAPY: 0,
        rowanUsd: poolData.rowanUSD,
      };

      return response;
    },
    {
      enabled: poolStatsQuery.isSuccess,
    },
  );

  const isLoading = computed(() => {
    return poolStatsRes.isLoading.value || !Object.keys(store.pools).length;
  });

  const pools = computed(() => {
    if (isLoading.value) return [];

    const assetLookup: Record<string, IAsset> = {};
    useNativeChain()
      .assets.filter((asset) => !isAssetFlaggedDisabled(asset))
      .forEach((asset) => {
        assetLookup[asset.symbol.toLowerCase()] = asset;
        let noPrefix = "";
        if (asset.symbol.toLowerCase().startsWith("c")) {
          noPrefix = asset.symbol.replace(/^c/, "").toLowerCase();
        } else {
          noPrefix = symbolWithoutPrefix(asset.symbol).toLowerCase();
        }
        if (noPrefix !== asset.symbol.toLowerCase()) {
          assetLookup[noPrefix] = asset;
        }
      });

    const poolStatLookup: Record<string, PoolStat> = {};
    poolStatsRes.data.value?.poolData.pools.forEach((poolStat) => {
      const asset =
        assetLookup[poolStat.symbol.toLowerCase()] ||
        assetLookup[poolStat.symbol];

      if (!asset) {
        if (!hasLoggedError[poolStat.symbol]) {
          // Don't spam logs for not-found stats, because this happens a lot
          hasLoggedError[poolStat.symbol] = true;
          if (process.env.NODE_ENV !== "production") {
            console.log("Found no asset match for poolStat", poolStat);
          }
        }
        return;
      }

      poolStatLookup[asset.symbol] = {
        ...poolStat,
        symbol: asset.symbol,
        rowanUSD: parseFloat(poolStatsRes.data.value?.rowanUsd ?? "0"),
      };
    });

    // poolStats endpoint might not have data for EVERY pool that exists
    // in store.pools. so use store.pools as source of truth for which pools
    // exist, then if poolStats doesn't have data default to empty.
    const pools = Object.values(store.pools).map((pool) => ({
      ...pool,
      rowanUSD: poolStatsRes.data.value?.rowanUsd || 0,
    }));
    return pools.map((pool) => {
      const [, externalAssetAmount] = pool.amounts;
      return (
        poolStatLookup[externalAssetAmount.asset.symbol] || {
          symbol: externalAssetAmount.asset.symbol,
          priceToken: null,
          rowanUSD: null,
          poolDepth: null,
          volume: null,
          arb: null,
        }
      );
    });
  });

  const wrappedData = computed(() => {
    if (isLoading.value || !poolStatsRes.data.value) return null;

    return {
      ...poolStatsRes.data.value,
      poolData: {
        ...poolStatsRes.data.value.poolData,
        pools: pools.value,
      },
    };
  });

  return {
    isLoading,
    data: wrappedData,
    isError: poolStatsRes.isError,
  };
}
