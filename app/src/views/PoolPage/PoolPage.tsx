import BigNumber from "bignumber.js";
import { formatDistance } from "date-fns";
import { computed, defineComponent } from "vue";
import { RouterView } from "vue-router";

import AssetIcon from "@/components/AssetIcon";
import { Button } from "@/components/Button/Button";
import Layout from "@/components/Layout";
import PageCard from "@/components/PageCard";
import RecyclerView from "@/components/RecyclerView";
import { SearchBox } from "@/components/SearchBox";
import { useRemoveLiquidityMutation } from "@/domains/clp/mutation/liquidity";
import { useCurrentRewardPeriod } from "@/domains/clp/queries/params";
import { flagsStore, isAssetFlaggedDisabled } from "@/store/modules/flags";
import { ElementOf } from "@/utils/types";
import {
  CompetitionsBySymbolLookup,
  useLeaderboardCompetitions,
} from "../LeaderboardPage/useCompetitionData";
import PoolItem from "./PoolItem";
import {
  COLUMNS,
  PoolPageColumnId,
  PoolRewardProgram,
  usePoolPageData,
} from "./usePoolPageData";

type PoolDataArray = ReturnType<
  typeof usePoolPageData
>["allPoolsData"]["value"];

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
          <RecyclerView
            rowHeight={57}
            class="flex min-h-[calc(80vh-130px)] w-full flex-col py-2"
            emptyState={
              <div class="grid w-full flex-1 place-items-center rounded-md bg-white/10 p-4 text-center">
                {!this.isLoading ? (
                  <span class="text-accent-base flex items-center gap-1 text-lg">
                    Loading Pools
                    <AssetIcon icon="interactive/anim-racetrack-spinner" />
                  </span>
                ) : this.searchQuery ? (
                  <span class="text-accent-base text-lg">
                    We can't seem to find that token.
                    <br /> Search for another token to continue
                  </span>
                ) : (
                  <span class="text-accent-base text-lg">
                    Please import assets to view balances
                  </span>
                )}
              </div>
            }
            header={
              <div class="flex justify-start">
                {COLUMNS.map((column) => (
                  <div
                    key={column.name}
                    onClick={() => {
                      if (!column.sortable) return;
                      if (this.sortBy === column.id) {
                        this.sortReverse = !this.sortReverse;
                      } else {
                        this.sortReverse = false;
                        this.sortBy = column.id;
                      }
                    }}
                    class={[
                      column.class,
                      "flex items-center text-sm opacity-50",
                      column.sortable && "cursor-pointer",
                    ]}
                  >
                    {column.name}
                    {column.help && (
                      <Button.InlineHelp>{column.help}</Button.InlineHelp>
                    )}
                    <AssetIcon
                      icon="interactive/arrow-down"
                      class={[
                        "pl-0.5",
                        (!column.sortable || this.sortBy !== column.id) &&
                          "invisible",
                        this.sortReverse && "rotate-180",
                      ]}
                    />
                  </div>
                ))}
                <div class="w-[24px]" />
              </div>
            }
            data={data}
            renderItem={(item: ElementOf<PoolDataArray>) => {
              const rewardsPrograms =
                this.poolRewardProgramLookup[
                  item.pool.externalAmount!.symbol
                ] ?? [];

              const itemLp = item.liquidityProvider?.liquidityProvider;
              const filteredUnlock =
                item.liquidityProvider?.liquidityProvider?.unlocks.filter(
                  (x) => !x.expired,
                );
              const isUnlockable =
                new BigNumber(
                  itemLp?.liquidityProviderUnits ?? 0,
                ).isGreaterThan(0) && (filteredUnlock?.length ?? 0) === 0;
              const unlock = filteredUnlock?.[0];

              const currentRewardPeriod = this.currentRewardPeriod.data.value;

              return (
                <PoolItem
                  currentRewardPeriod={
                    currentRewardPeriod === undefined
                      ? undefined
                      : {
                          endEta: formatDistance(
                            new Date(),
                            currentRewardPeriod.estimatedRewardPeriodEndDate,
                          ),
                        }
                  }
                  unLockable={isUnlockable}
                  unlock={
                    unlock === undefined
                      ? undefined
                      : {
                          ...unlock,
                          nativeAssetAmount:
                            unlock.nativeAssetAmount.toFixed(6),
                          externalAssetAmount:
                            unlock.externalAssetAmount.toFixed(6),
                          expiration:
                            unlock.expiration === undefined
                              ? undefined
                              : formatDistance(new Date(), unlock.expiration),
                          eta:
                            unlock.eta === undefined
                              ? undefined
                              : formatDistance(new Date(), unlock.eta),
                          isRemovalInProgress:
                            this.removeLiquidityMutation.isLoading.value,
                          isActiveRemoval:
                            this.removeLiquidityMutation.variables.value
                              ?.requestHeight === unlock.requestHeight,
                          onRemoveRequest: () =>
                            this.removeLiquidityMutation.mutate({
                              requestHeight: unlock.requestHeight,
                              externalAssetSymbol:
                                item.pool.externalAmount!.symbol,
                              units: unlock.units,
                            }),
                        }
                  }
                  bonusRewardPrograms={rewardsPrograms}
                  competitionsLookup={
                    this.symbolCompetitionsLookup?.[
                      item.pool.externalAmount!.symbol
                    ]
                  }
                  pool={item.pool}
                  poolStat={item.poolStat}
                  accountPool={item.accountPool}
                  key={item.pool.symbol()}
                />
              );
            }}
          />
        </PageCard>
      </Layout>
    );
  },
});
