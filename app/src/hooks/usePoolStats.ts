import { computed } from "vue";
import { IAsset } from "@sifchain/sdk";

import { isAssetFlaggedDisabled } from "@/store/modules/flags";
import { symbolWithoutPrefix } from "@/utils/symbol";
import { useAsyncDataCached } from "./useAsyncDataCached";
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
  poolDepth: string;
  volume: string;
  arb?: string;
  poolAPY: string;
  rewardAPY: string;
  totalAPY: string;
}

export interface Headers {
  "Access-Control-Allow-Origin": string;
}

const hasLoggedError: Record<string, boolean> = {};

export const usePoolStats = () => {
  const { store, services } = useCore();

  const poolStatsRes = useAsyncDataCached("poolStats", async () => {
    const { body: poolData } = await services.data.getTokenStats();

    const rewardPrograms = await services.data.getRewardsPrograms();

    const response = {
      poolData: {
        ...poolData,
        pools: poolData.pools.map((p) => {
          const poolAPY = p.poolAPY
            ? Number(p.poolAPY)
            : (parseFloat(p?.volume || "0") / parseFloat(p?.poolDepth || "0")) *
              100;

          const rewardAPY = rewardPrograms.reduce((acc, program) => {
            const incentivisedSymbols = program.incentivizedPoolSymbols.map(
              (x) => x.slice(1),
            );

            const isIndividuallyIncentivized =
              program.incentivizedPoolSymbols?.includes(p.symbol) ||
              incentivisedSymbols.includes(p.symbol);

            if (program.isUniversal || isIndividuallyIncentivized) {
              return acc + program.summaryAPY;
            }
            return acc;
          }, 0);

          return {
            ...p,
            poolAPY: poolAPY.toFixed(1),
            rewardAPY: rewardAPY.toFixed(1),
            totalAPY: (poolAPY + rewardAPY).toFixed(1),
          };
        }),
      },
      liqAPY: 0,
      rowanUsd: poolData.rowanUSD,
    };

    return response;
  });

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
          console.log("Found no asset match for poolStat", poolStat);
        }
        return;
      }

      poolStatLookup[asset.symbol] = {
        ...poolStat,
        symbol: asset.symbol,
      };
    });

    // poolStats endpoint might not have data for EVERY pool that exists
    // in store.pools. so use store.pools as source of truth for which pools
    // exist, then if poolStats doesn't have data default to empty.
    const pools = Object.values(store.pools);
    return pools.map((pool) => {
      const [, externalAssetAmount] = pool.amounts;
      return (
        poolStatLookup[externalAssetAmount.asset.symbol] || {
          symbol: externalAssetAmount.asset.symbol,
          priceToken: null,
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
};
