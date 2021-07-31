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
}

export interface Headers {
  "Access-Control-Allow-Origin": string;
}

export const usePoolStats = () => {
  const data = useAsyncDataCached("poolStats", async () => {
    const { services } = useCore();
    const data = await fetch(
      "https://data.sifchain.finance/beta/asset/tokenStats",
    );
    const json: PoolStatsResponseData = await data.json();
    const poolData = json.body;
    // const lmJson = await services.cryptoeconomics.fetchData({
    //   rewardType: "lm",
    //   address: "sif100snz8vss9gqhchg90mcgzkjaju2k76y7h9n6d",
    //   key: "userData",
    //   timestamp: "now",
    // });
    // const liqAPY = lmJson?.user ? lmJson?.user?.currentAPYOnTickets * 100 : 0;
    return {
      poolData,
      liqAPY: 0,
      rowanUsd: poolData.rowanUSD,
    };
  });
  return data;
};
