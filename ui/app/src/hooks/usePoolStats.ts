import { symbolWithoutPrefix } from "@/utils/symbol";
import { getChainsService, IAsset, Network } from "@sifchain/sdk";
import { computed } from "vue";
import { useAsyncData } from "./useAsyncData";
import { useAsyncDataCached } from "./useAsyncDataCached";
import { useCore } from "./useCore";

export interface PoolStatsResponseData {
  statusCode: number;
  headers: Headers;
  body: Body;
}

interface Body {
  liqAPY: string;
  rowanUSD: number;
  pools: PoolStat[];
}

export interface PoolStat {
  symbol: string;
  priceToken: string;
  poolDepth: string;
  volume: string;
  arb: string;
  poolAPY: string;
}

export interface Headers {
  "Access-Control-Allow-Origin": string;
}

export const usePoolStats = () => {
  const { store, services } = useCore();

  const data = useAsyncDataCached("poolStats", async () => {
    let cryptoeconSummaryAPY = await services.cryptoeconomics
      .fetchSummaryAPY()
      .catch((e) => console.error(e));
    cryptoeconSummaryAPY = cryptoeconSummaryAPY || 0;
    const res = await fetch(
      "https://data.sifchain.finance/beta/asset/tokenStats",
    );
    const json: PoolStatsResponseData = await res.json();
    const poolData = json.body;
    return {
      poolData: {
        ...poolData,
        pools: poolData.pools.map((p) => ({
          ...p,
          poolAPY: (
            (parseFloat(p?.volume || "0") / parseFloat(p?.poolDepth || "0")) *
              100 +
            (/(akt|vpn|atom)/gim.test(p.symbol) ? cryptoeconSummaryAPY || 0 : 0)
          ).toFixed(1),
        })),
      },
      liqAPY: 0,
      rowanUsd: poolData.rowanUSD,
      cryptoeconSummaryAPY: cryptoeconSummaryAPY,
    };
  });

  const isLoading = computed(() => {
    return data.isLoading.value || !Object.keys(store.pools).length;
  });

  const pools = computed(() => {
    if (isLoading.value) return [];

    const noPrefixAssetLookup: Record<string, IAsset> = {};
    getChainsService()
      .get(Network.SIFCHAIN)
      .assets.forEach((asset) => {
        noPrefixAssetLookup[
          symbolWithoutPrefix(asset.symbol).toLowerCase()
        ] = asset;
      });

    const poolStatLookup: Record<string, PoolStat> = {};
    data.data.value?.poolData.pools.forEach((poolStat) => {
      const asset =
        noPrefixAssetLookup[poolStat.symbol.toLowerCase()] ||
        noPrefixAssetLookup[poolStat.symbol];

      if (!asset) {
        return console.log("Found asset no match for poolStat", poolStat);
      }

      poolStatLookup[asset.symbol] = {
        ...poolStat,
        symbol: asset.symbol,
      };
    });

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
    if (isLoading.value || !data.data.value) return null;

    return {
      ...data.data.value,
      poolData: {
        ...data.data.value.poolData,
        pools: pools.value,
      },
    };
  });

  return {
    isLoading,
    data: wrappedData,
    isError: data.isError,
  };
};
