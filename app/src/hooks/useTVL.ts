import { useAsyncData } from "@/hooks/useAsyncData";
import { useCore } from "@/hooks/useCore";
import { prettyNumber } from "@/utils/prettyNumber";

export function useTVL() {
  const { services } = useCore();

  const loadTVL = async () => {
    const tokenStats = await services.data.getTokenStats();

    const pools = tokenStats.body.pools ?? [];

    const total = pools.reduce((acc, pool) => acc + pool.poolTVL, 0);

    return { formatted: "$" + prettyNumber(total), raw: total };
  };

  return useAsyncData(loadTVL);
}
