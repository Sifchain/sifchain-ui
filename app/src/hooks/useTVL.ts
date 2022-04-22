import { useAsyncData } from "@/hooks/useAsyncData";
import { useCore } from "@/hooks/useCore";
import { prettyNumber } from "@/utils/prettyNumber";

export function useTVL() {
  const { services } = useCore();

  const loadTVL = async () => {
    const tokenStats = await services.data.getTokenStatsPMTP();

    const pools = tokenStats.body.pools ?? [];

    const total = pools.reduce(
      (acc, { poolTVL, poolDepth }) =>
        acc +
        (typeof poolTVL === "string" || typeof poolTVL === "number"
          ? Number(poolTVL ?? "0")
          : parseFloat(poolDepth as any) * 2),
      0,
    );

    return { formatted: "$" + prettyNumber(total), raw: total };
  };

  return useAsyncData(loadTVL);
}
