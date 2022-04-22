import AssetIcon from "@/components/AssetIcon";
import { Button } from "@/components/Button/Button";
import Layout from "@/components/Layout";
import PageCard from "@/components/PageCard";
import { SearchBox } from "@/components/SearchBox";
import { useRemoveLiquidityMutation } from "@/domains/clp/mutation/liquidity";
import { useCurrentRewardPeriod } from "@/domains/clp/queries/params";
import { useNativeChain } from "@/hooks/useChains";
import { flagsStore, isAssetFlaggedDisabled } from "@/store/modules/flags";
import BigNumber from "bignumber.js";
import { formatDistance } from "date-fns";
import { defineComponent } from "vue";
import { RouterView } from "vue-router";
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

export default defineComponent({
  name: "PoolsPage",
  data() {
    return {
      allPoolsData: [] as ReturnType<
        typeof usePoolPageData
      >["allPoolsData"]["value"],
      sortBy: "rewardApy" as PoolPageColumnId,
      sortReverse: false,
      searchQuery: "",
    };
  },
  setup() {
    const data = usePoolPageData();
    return {
      removeLiquidityMutation: useRemoveLiquidityMutation({
        onSuccess: () => data.reload(),
      }),
      currentRewardPeriod: useCurrentRewardPeriod(),
      competitionsRes: useLeaderboardCompetitions(),
      rewardProgramsRes: data.rewardProgramsRes,
      allPoolsData: data.allPoolsData,
      isLoaded: data.isLoaded,
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

        program.incentivizedPoolSymbols.forEach((symbol) => {
          const asset = useNativeChain().findAssetWithLikeSymbol(symbol);

          if (asset) {
            let list = lookup[asset.symbol];
            if (!list) list = lookup[asset.symbol] = [];
            list.push(program);
          }
        });
      });

      for (const symbol in lookup) {
        lookup[symbol.slice(1)] = lookup[symbol];
      }

      return lookup;
    },
    symbolCompetitionsLookup(): CompetitionsBySymbolLookup | null {
      return this.competitionsRes.data?.value || null;
    },
    sanitizedPoolData(): ReturnType<
      typeof usePoolPageData
    >["allPoolsData"]["value"] {
      if (!this.isLoaded) return [];

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
    return (
      <Layout>
        <RouterView
          name={
            flagsStore.state.allowEmptyLiquidityAdd
              ? undefined
              : !this.isLoaded
              ? "DISABLED_WHILE_LOADING"
              : undefined
          }
        />
        {!this.isLoaded ? (
          <div class="absolute left-0 top-[180px] flex w-full justify-center">
            <div class="flex h-[80px] w-[80px] items-center justify-center rounded-lg bg-black bg-opacity-50">
              <AssetIcon icon="interactive/anim-racetrack-spinner" size={64} />
            </div>
          </div>
        ) : (
          <PageCard
            heading="Pool"
            iconName="navigation/pool"
            withOverflowSpace
            headerAction={
              <Button.Inline
                to={{ name: "AddLiquidity", params: {} }}
                active
                replace
                class={["text-md !h-[40px] px-[17px]"]}
                icon="interactive/plus"
              >
                <div class="font-semibold">Add Liquidity</div>
              </Button.Inline>
            }
            headerContent={
              <>
                <SearchBox
                  containerClass="mb-4"
                  value={this.searchQuery}
                  placeholder="Search Pool..."
                  onInput={(e: Event) => {
                    this.searchQuery = (e.target as HTMLInputElement).value;
                  }}
                />
                <div class="mb-[-5px] flex w-full flex-row justify-start pb-[5px]">
                  {COLUMNS.map((column, index) => (
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
                        "flex items-center opacity-50",
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
                          "mr-[-22px] pl-[2px]",
                          (!column.sortable || this.sortBy !== column.id) &&
                            "invisible",
                          this.sortReverse && "rotate-180",
                        ]}
                      />
                    </div>
                  ))}
                  <div class="w-[24px]" />
                </div>
              </>
            }
          >
            {this.sanitizedPoolData.map((item) => {
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
            })}
          </PageCard>
        )}
      </Layout>
    );
  },
});
