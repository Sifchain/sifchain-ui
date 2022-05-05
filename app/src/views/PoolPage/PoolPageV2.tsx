import { computed, defineComponent } from "vue";
import { RouterView } from "vue-router";

import { Button } from "~/components/Button/Button";
import Layout from "~/components/Layout";
import PageCard from "~/components/PageCard";
import { SearchBox } from "~/components/SearchBox";
import { useRemoveLiquidityMutation } from "~/domains/clp/mutation/liquidity";
import { useCurrentRewardPeriod } from "~/domains/clp/queries/params";
import { flagsStore, isAssetFlaggedDisabled } from "~/store/modules/flags";

import {
  CompetitionsBySymbolLookup,
  useLeaderboardCompetitions,
} from "../LeaderboardPage/useCompetitionData";
import OwnPool from "./children/OwnPool";
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
    poolRewardProgramLookup(): Record<string, PoolRewardProgram[]> {
      const lookup: Record<string, PoolRewardProgram[]> = {};

      this.rewardProgramsRes.data.value?.forEach((program) => {
        if (program.isUniversal) return;

        if (
          new Date() < new Date(program.startDateTimeISO ?? "") ||
          new Date() > new Date(program.endDateTimeISO ?? "")
        ) {
          return;
        }
      });

      for (const symbol in lookup) {
        lookup[symbol.slice(1)] = lookup[symbol];
      }

      return lookup;
    },
    symbolCompetitionsLookup(): CompetitionsBySymbolLookup | null {
      return this.competitionsRes.data?.value || null;
    },
    sanitizedPoolData(): PoolDataArray {
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
    usePools(): PoolDataArray {
      return this.sanitizedPoolData.filter((x) => x.accountPool);
    },

    publicPools(): PoolDataArray {
      return this.sanitizedPoolData.filter((x) => !x.accountPool);
    },
  },

  render() {
    const data = computed(() => this.sanitizedPoolData);
    return (
      <Layout>
        <RouterView
          name={
            flagsStore.state.allowEmptyLiquidityAdd
              ? undefined
              : this.isLoading
              ? "DISABLED_WHILE_LOADING"
              : undefined
          }
        />
        <PageCard
          heading="Pool"
          iconName="navigation/pool"
          headerAction={
            <Button.Inline
              class="relative !h-[40px] px-4 !text-lg"
              iconClass="!w-[24px] !h-[24px] transform translate-y-[1px]"
              to={{ name: "AddLiquidity", params: {} }}
              active
              replace
              icon="interactive/plus"
            >
              <div class="font-semibold">Add Liquidity</div>
            </Button.Inline>
          }
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

          {this.usePools.length > 0 && (
            <section>
              <ul class="grid gap-2 md:grid-cols-3 lg:gap-4 xl:gap-6">
                {this.usePools.map((item) => (
                  <OwnPool key={item.pool.symbol()} context={item} />
                ))}
              </ul>
            </section>
          )}
          {/* {this.publicPools.length > 0 && (
            <section>
              <ul class="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {this.publicPools.map((item) => (
                  <li
                    role="article"
                    key={item.pool.symbol()}
                    class="bg-gray-sif_800 grid rounded-lg p-4"
                  >
                    <header class="flex items-center p-2">
                      <AssetPair
                        asset={ref(item.pool.externalAmount.asset)}
                        invert
                      />
                    </header>
                    <main>
                      <ul>{}</ul>
                    </main>
                    <footer></footer>
                  </li>
                ))}
              </ul>
            </section>
          )} */}
        </PageCard>
      </Layout>
    );
  },
});
