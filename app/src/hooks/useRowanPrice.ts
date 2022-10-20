import { watchEffect } from "vue";

import { useCore } from "~/hooks/useCore";
import { useAsyncDataCached } from "~/hooks/useAsyncDataCached";

function isNumeric(s: string): boolean {
  return Number(s) - 0 === Number(s) && ("" + s).trim().length > 0;
}

export const useRowanPrice = (params?: { shouldReload: boolean }) => {
  const { services } = useCore();

  const price = useAsyncDataCached("rowanPrice", async () => {
    const stats = await services.data.getTokenStats();
    const rowanPriceInUSDT = stats.rowanUSD ?? "";

    if (isNumeric(rowanPriceInUSDT)) {
      return parseFloat(rowanPriceInUSDT).toPrecision(6);
    }
  });

  watchEffect(async (onInvalidate) => {
    if (!params?.shouldReload) return;
    let shouldBreak = false;
    while (!shouldBreak) {
      await new Promise((r) => setTimeout(r, 300 * 1000));
      price.reload.value();
    }
    onInvalidate(() => {
      shouldBreak = true;
    });
  });

  return price;
};
