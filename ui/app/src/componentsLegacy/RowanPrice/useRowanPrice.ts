import { useAsyncData } from "@/hooks/useAsyncData";
import { useAsyncDataCached } from "@/hooks/useAsyncDataCached";
import { useCore } from "@/hooks/useCore";
import { ref, Ref, watch, watchEffect } from "vue";

export const useRowanPrice = (params?: { shouldReload: boolean }) => {
  const price = useAsyncDataCached("rowanPrice", async () => {
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

const loadPrice = async (params: { symbol: string }) => {
  const core = useCore();
  const dex = await core.services.sif.loadNativeDexClient();

  const externalAsset =
    core!.services.chains.nativeChain.findAssetWithLikeSymbolOrThrow(
      params.symbol,
    );
  const registryItem = await core.services.tokenRegistry.findAssetEntryOrThrow(
    externalAsset,
  );

  const pool = await dex!.query.clp.GetPool({
    symbol: registryItem.denom,
  });

  console.log({ pool });
  const nativeAsset = core!.services.chains.nativeChain.nativeAsset;
  return (
    +pool.pool!.nativeAssetBalance /
    10 ** nativeAsset.decimals /
    (+pool.pool!.externalAssetBalance / 10 ** externalAsset.decimals)
  );
};

export const useTokenPrice = (params: { symbol: Ref<string> }) => {
  const core = useCore();
  const price = ref(0);
  const priceCache: { [key: string]: number } = {};
  const loadCachedPrice = async ({ symbol }: { symbol: string }) => {
    if (priceCache[symbol]) {
      return priceCache[symbol];
    }
    const price = await loadPrice({ symbol });
    priceCache[symbol] = price;
    return price;
  };
  watch(
    [params.symbol],
    async () => {
      try {
        price.value = 0;
        const stableCoinPrice = await loadCachedPrice({ symbol: "cusdc" });
        if (params.symbol.value === "rowan") {
          price.value = 1 / stableCoinPrice;
          return;
        }
        const tokenPrice = await loadCachedPrice({
          symbol: params.symbol.value,
        });
        price.value = tokenPrice / stableCoinPrice;
      } catch (e) {
        price.value = 0;
      }
    },
    {
      immediate: true,
    },
  );
  return price;
};
