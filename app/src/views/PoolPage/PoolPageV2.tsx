import { computed, defineComponent } from "vue";

import Layout from "~/components/Layout";
import PageCard from "~/components/PageCard";
import { SearchBox } from "~/components/SearchBox";
import { useRemoveLiquidityMutation } from "~/domains/clp/mutation/liquidity";
import { useCurrentRewardPeriod } from "~/domains/clp/queries/params";
import { isAssetFlaggedDisabled } from "~/store/modules/flags";

import {
  CompetitionsBySymbolLookup,
  useLeaderboardCompetitions,
} from "../LeaderboardPage/useCompetitionData";
import PoolCard from "./children/PoolCard";
import {
  PoolDataArray,
  PoolPageColumnId,
  PoolRewardProgram,
  usePoolPageData,
} from "./usePoolPageData";

export default defineComponent({
  name: "PoolsPage",
  data() {
    return {
      allPoolsData: [] as PoolDataArray,
      sortBy: "rewardApy" as PoolPageColumnId,
      sortReverse: false,
      searchQuery: "",
    };
  },
  setup() {
    const data = usePoolPageData();
    const currentRewardPeriod = useCurrentRewardPeriod();
    return {
      removeLiquidityMutation: useRemoveLiquidityMutation({
        onSuccess: () => data.reload(),
      }),
      currentRewardPeriod,
      competitionsRes: useLeaderboardCompetitions(),
      rewardProgramsRes: data.rewardProgramsRes,
      allPoolsData: data.allPoolsData,
      isLoading: computed(
        () => data.isLoading.value || currentRewardPeriod.isLoading.value,
      ),
    };
  },
  computed: {
    poolEntries(): PoolDataArray {
      if (this.isLoading && !this.allPoolsData.length) return [];

      const result = this.allPoolsData
        .filter((item) => {
          const asset = item.pool.externalAmount?.asset;
          if (!asset) return;

          if (isAssetFlaggedDisabled(asset)) return false;

          if (
            this.searchQuery.length > 0 &&
            !asset.symbol.toLowerCase().includes(this.searchQuery)
          ) {
            return false;
          }

          return (
            !asset.decommissioned ||
            // Show decommissioned assets if user has a share.
            (asset.decommissioned && item.accountPool?.lp.units)
          );
        })
        // First sort by name or apy
        .sort((a, b) => {
          if (this.$data.sortBy === "token") {
            const aAsset = a.pool.externalAmount!.asset;
            const bAsset = b.pool.externalAmount!.asset;
            return aAsset.displaySymbol.localeCompare(bAsset.displaySymbol);
          } else if (this.$data.sortBy === "rewardApr") {
            return (b.poolStat?.rewardApr ?? 0) - (a.poolStat?.rewardApr ?? 0);
          } else {
            return (b.poolStat?.poolApr ?? 0) - (a.poolStat?.poolApr ?? 0);
          }
        })
        // Then sort by balance
        .sort((a, b) => {
          if (a.accountPool && b.accountPool) {
            return (
              +b.accountPool.lp.units.toString() -
              +a.accountPool.lp.units.toString()
            );
          }
          if (a.accountPool && !b.accountPool) return -1;
          if (b.accountPool && !a.accountPool) return 1;
          return 0;
        });

      if (this.$data.sortReverse) {
        return [...result].reverse();
      }

      return result;
    },
  },

  render() {
    const data = computed(() => this.poolEntries);
    return (
      <Layout>
        <PageCard
          breadCrumbs={["Pool"]}
          headerContent={
            <SearchBox
              placeholder="Search Pool..."
              value={this.searchQuery}
              onInput={(e: Event) => {
                this.searchQuery = (e.target as HTMLInputElement).value;
              }}
            />
          }
        >
          {this.isLoading && !data.value.length && (
            <div class="flex justify-center p-8">Loading pools...</div>
          )}

          {this.poolEntries.length > 0 && (
            <section>
              <ul class="4xl:grid-cols-4 grid gap-2 md:grid-cols-2 lg:grid-cols-3 lg:gap-4 2xl:gap-6">
                {this.poolEntries.map((item) => (
                  <PoolCard key={item.pool.symbol()} context={item} />
                ))}
              </ul>
            </section>
          )}
        </PageCard>
      </Layout>
    );
  },
});
