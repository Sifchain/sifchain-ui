import { useAsyncData } from "@/hooks/useAsyncData";
import { useAsyncDataCached } from "@/hooks/useAsyncDataCached";
import { watchEffect } from "vue";
import { useCore } from "./useCore";

export const useTokenPrice = (
  denom: string,
  params?: { shouldReload: boolean },
) => {
  const core = useCore();

  const price = useAsyncDataCached("tokenPricesTokenStats", async () => {
    const client = await core.services.sif.loadNativeDexClient();
    const pool = await client.query.clp.GetPool({
      symbol: denom,
    });
    const stablePool = await client.query.clp.GetPool({
      symbol: "cusdt",
    });
    stablePool;
    function isNumeric(s: any) {
      return s - 0 == s && ("" + s).trim().length > 0;
    }
    const data = await fetch(
      "https://data.sifchain.finance/beta/asset/tokenStats",
    );
    const json = await data.json();
    const rowanPriceInUSDT = json.body ? json.body.rowanUSD : "";

    if (isNumeric(rowanPriceInUSDT)) {
      return parseFloat(rowanPriceInUSDT).toPrecision(6);
    }
  });

  watchEffect(async (onInvalidate) => {
    if (!params?.shouldReload) return;
    let shouldBreak = false;
    while (!shouldBreak) {
      await price.reload.value();
      await new Promise((r) => setTimeout(r, 300 * 1000));
    }
    onInvalidate(() => {
      shouldBreak = true;
    });
  });

  return price;
};
