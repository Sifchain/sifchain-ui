import AssetPair from "@/components/AssetPair";
import { usePoolStats } from "@/hooks/usePoolStats";
import { prettyNumber } from "@/utils/prettyNumber";
import { computed, defineComponent, ref } from "vue";
import { useRoute } from "vue-router";

import Layout from "~/components/Layout";
import PageCard from "~/components/PageCard";
import { usePoolQuery } from "~/domains/clp/queries/pool";
import { useAssetBySymbol } from "~/hooks/useAssetBySymbol";
import { useCore } from "~/hooks/useCore";

export default defineComponent({
  name: "PoolDetailsPage",
  setup() {
    const route = useRoute();
    const poolId = String(route.params["poolId"])
      .toUpperCase()
      .replace("_", "-");

    const { poolFinder } = useCore();

    const [leftSymbol, rightSymbol] = poolId.toLowerCase().split("-");
    const leftAsset = useAssetBySymbol(ref(leftSymbol));
    const rightAsset = useAssetBySymbol(ref(rightSymbol));

    const externalAsset = computed(
      () =>
        [leftAsset, rightAsset].find(
          (x) => x.value?.symbol.toLowerCase() !== "rowan",
        )?.value,
    );

    const { isLoading } = usePoolQuery(externalAsset.value?.symbol ?? "");

    const pool = computed(() => {
      if (!leftAsset.value || !rightAsset.value) {
        return undefined;
      }
      return poolFinder(leftAsset.value.symbol, rightAsset.value.symbol)?.value;
    });

    const { data: poolStats, isLoading: isLoadingStats } = usePoolStats();

    const stats = computed(() => {
      if (!pool.value || !poolStats.value) {
        return undefined;
      }

      const poolStat = poolStats.value.poolData.pools.find(
        (x) => x.symbol === externalAsset.value?.symbol,
      );

      return [
        [
          "Total liquidity",
          poolStat?.poolTVL ? `$${prettyNumber(poolStat.poolTVL)}` : 0,
        ],
        [
          "Trading volume",
          poolStat?.poolTVL ? `$${prettyNumber(poolStat.poolTVL)}` : 0,
        ],
        [
          "Total amount (ROWAN)",
          poolStat?.poolTVL ? `$${prettyNumber(poolStat.poolTVL)}` : 0,
        ],
        [
          `Total amount (${
            externalAsset.value?.displaySymbol.toUpperCase() ?? "..."
          })`,
          poolStat?.poolTVL ? `$${prettyNumber(poolStat.poolTVL)}` : 0,
        ],
        [
          `Pool APR`,
          poolStat?.poolTVL ? `$${prettyNumber(poolStat.poolTVL)}` : 0,
        ],
        [
          `Arb opportunity`,
          poolStat?.poolTVL ? `$${prettyNumber(poolStat.poolTVL)}` : 0,
        ],
      ];
    });

    return () => {
      if (isLoading.value && !pool.value) {
        return (
          <Layout>
            <PageCard withBackButton breadCrumbs={["Pools", poolId]}>
              Loading pool data...
            </PageCard>
          </Layout>
        );
      }

      return (
        <Layout>
          <PageCard
            withBackButton
            breadCrumbs={["Pools", poolId]}
            class="flex flex-1 flex-col gap-4 md:gap-8"
          >
            <h2 class="mb-8 flex gap-12">
              <AssetPair asset={externalAsset} hideTokenSymbol size="lg" />{" "}
              {poolId}
            </h2>
            <div class="grid flex-wrap gap-4 lg:flex">
              <section class="flex flex-1 flex-col gap-4">
                <header class="">
                  <h3 class="text-gray-sif200 text-base font-semibold">
                    Pool Stats
                  </h3>
                </header>
                {isLoadingStats.value && !stats.value && (
                  <div>Loading pool stats...</div>
                )}
                <ul class="grid gap-2 md:grid-cols-2">
                  {stats.value?.map(([label, value]) => (
                    <li
                      class="flex items-center justify-between gap-1 md:grid"
                      key={label}
                    >
                      <span class="text-gray-sif300 text-sm">{label}</span>
                      <span class="text-gray-sif50 text-base font-semibold">
                        {value}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
              <section class="flex-1">
                <div class="bg-gray-sif800 min-h-[40vh] w-full max-w-lg rounded-lg p-4">
                  <ul></ul>
                </div>
              </section>
            </div>
          </PageCard>
        </Layout>
      );
    };
  },
});
