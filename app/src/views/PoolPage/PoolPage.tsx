import Long from "long";
import BigNumber from "bignumber.js";
import { formatDistance } from "date-fns";
import { computed, defineComponent, effect } from "vue";
import { RouterView } from "vue-router";

import AssetIcon from "~/components/AssetIcon";
import { Button } from "~/components/Button/Button";
import Layout from "~/components/Layout";
import PageCard from "~/components/PageCard";
import { SearchBox } from "~/components/SearchBox";
import Toggle from "~/components/Toggle";
import {
  useCancelLiquidityUnlockMutation,
  useRemoveLiquidityMutation,
} from "~/domains/clp/mutation/liquidity";
import {
  useCurrentProviderDistributionPeriod,
  useCurrentRewardPeriod,
  useRewardsParamsQuery,
} from "~/domains/clp/queries/params";
import { flagsStore, isAssetFlaggedDisabled } from "~/store/modules/flags";
import PoolItem from "./PoolItem";
import { COLUMNS, PoolPageColumnId, usePoolPageData } from "./usePoolPageData";

export const SMALL_POOL_CAP = 10_000;

export default defineComponent({
  name: "PoolsPage",
  data() {
    return {
      sortBy: "pairedApr" as PoolPageColumnId,
      sortReverse: false,
      searchQuery: "",
      showSmallPools: false,
    };
  },
  setup() {
    const data = usePoolPageData();

    const currentRewardPeriod = useCurrentRewardPeriod();
    const currentProviderDistributionPeriod =
      useCurrentProviderDistributionPeriod();

    const rewardsParamsQuery = useRewardsParamsQuery();

    const isATOMPoolsDisabled = computed(
      () => flagsStore.state.remoteFlags.DISABLE_ATOM_POOL,
    );

    return {
      removeLiquidityMutation: useRemoveLiquidityMutation({
        onSuccess: () => data.reload(),
      }),
      cancelLiquidityUnlockMutation: useCancelLiquidityUnlockMutation(),
      currentRewardPeriod,
      currentLPDPeriod: currentProviderDistributionPeriod,
      rewardProgramsRes: data.rewardProgramsRes,
      allPoolsData: data.allPoolsData,
      lppdRewards: data.lppdRewards,
      isUnbondingRequired: computed(() =>
        rewardsParamsQuery.data.value?.params?.liquidityRemovalLockPeriod.gt(
          Long.ZERO,
        ),
      ),
      isLoading: computed(
        () =>
          data.isLoading.value ||
          currentRewardPeriod.isLoading.value ||
          currentProviderDistributionPeriod.isLoading.value ||
          rewardsParamsQuery.isLoading.value,
      ),
      isATOMPoolsDisabled,
    };
  },
  computed: {
    sanitizedPoolData(): ReturnType<
      typeof usePoolPageData
    >["allPoolsData"]["value"] {
      if (this.isLoading) {
        return [];
      }

      const result = this.allPoolsData
        .filter((item) =>
          this.showSmallPools
            ? true
            : item.accountPool?.lp.units.greaterThan(0) ||
              item.poolStat.poolTVL >= SMALL_POOL_CAP,
        )
        .filter((item) => {
          const asset = item.pool.externalAmount?.asset;
          if (!asset) {
            return;
          }

          if (isAssetFlaggedDisabled(asset)) {
            return false;
          }

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
        // First sort by name, apr or poolTVL.
        .sort((a, b) => {
          switch (this.sortBy) {
            case "token": {
              const aAsset = a.pool.externalAmount?.asset.displaySymbol;
              const bAsset = b.pool.externalAmount?.asset.displaySymbol;
              return aAsset.localeCompare(bAsset);
            }
            case "rowanApr":
              return (
                Number(b.poolStat?.rewardApr) - Number(a.poolStat?.rewardApr)
              );
            case "pairedApr":
              return (
                Number(b.poolStat?.pairedApr) - Number(a.poolStat?.pairedApr)
              );
            case "poolTvl":
              return Number(b.poolStat?.poolTVL) - Number(a.poolStat?.poolTVL);
            default:
              return (
                Number(b.poolStat?.rewardApr) - Number(a.poolStat?.rewardApr)
              );
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
          if (a.accountPool && !b.accountPool) {
            return -1;
          }
          if (b.accountPool && !a.accountPool) {
            return 1;
          }
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
              : this.isLoading
              ? "DISABLED_WHILE_LOADING"
              : undefined
          }
        />
        {this.isLoading ? (
          <div class="absolute left-0 top-[180px] flex w-full justify-center">
            <div class="flex h-[80px] w-[80px] items-center justify-center rounded-lg bg-black bg-opacity-50">
              <AssetIcon icon="interactive/anim-racetrack-spinner" size={64} />
            </div>
          </div>
        ) : (
          <PageCard
            heading="Pool"
            iconName="navigation/pool"
            withOverflowSpace={true}
            headerAction={
              <div class="flex-end flex items-center gap-2">
                <Toggle
                  class="flex flex-row-reverse"
                  label={`Show pools under ${SMALL_POOL_CAP.toLocaleString(
                    undefined,
                    {
                      style: "currency",
                      currency: "USD",
                      maximumFractionDigits: 0,
                    },
                  )} TVL`}
                  active={this.showSmallPools}
                  onChange={(active) => {
                    this.showSmallPools = active;
                  }}
                />
                <Button.Inline
                  to={{ name: "AddLiquidity", params: {} }}
                  active={true}
                  replace={true}
                  class={["text-md !h-[40px] px-[17px]"]}
                  icon="interactive/plus"
                >
                  <div class="font-semibold">Add Liquidity</div>
                </Button.Inline>
              </div>
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
                  {COLUMNS.map((column) => (
                    // rome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
                    <div
                      key={column.name}
                      role="button"
                      onClick={() => {
                        if (!column.sortable) {
                          return;
                        }
                        if (this.sortBy === column.id) {
                          this.sortReverse = !this.sortReverse;
                        } else {
                          this.sortReverse = false;
                          this.sortBy = column.id;
                        }
                      }}
                      class={[
                        column.class,
                        "flex select-none items-center opacity-50",
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
                          "border",
                          "pl-[2px]",
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

              const isRemovalInProgress =
                this.removeLiquidityMutation.variables.value?.requestHeight ===
                  unlock?.requestHeight &&
                this.removeLiquidityMutation.isLoading.value;

              const isCancelInProgress =
                this.cancelLiquidityUnlockMutation.variables.value
                  ?.requestHeight === unlock?.requestHeight &&
                this.cancelLiquidityUnlockMutation.isLoading.value;

              return (
                <PoolItem
                  key={item.pool.symbol()}
                  currentRewardPeriod={
                    currentRewardPeriod === undefined
                      ? undefined
                      : {
                          endEta: formatDistance(
                            new Date(),
                            currentRewardPeriod.estimatedRewardPeriodEndDate,
                          ),
                          isDistributingToWallets:
                            currentRewardPeriod.rewardPeriodDistribute,
                        }
                  }
                  isLPDActive={Boolean(this.currentLPDPeriod.data.value)}
                  isUnbondingRequired={this.isUnbondingRequired}
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
                          isRemovalDisabled:
                            this.removeLiquidityMutation.isLoading.value ||
                            isCancelInProgress,
                          isRemovalInProgress,
                          onRemoveRequest: () =>
                            this.removeLiquidityMutation.mutate({
                              requestHeight: unlock.requestHeight,
                              externalAssetSymbol:
                                item.pool.externalAmount.symbol,
                              units: unlock.units,
                            }),
                          isCancelDisabled:
                            this.cancelLiquidityUnlockMutation.isLoading
                              .value || isRemovalInProgress,
                          isCancelInProgress,
                          onCancelRequest: () =>
                            this.cancelLiquidityUnlockMutation.mutate({
                              requestHeight: unlock.requestHeight,
                              externalAssetSymbol:
                                item.pool.externalAmount.symbol,
                              units: unlock.units,
                            }),
                        }
                  }
                  pool={item.pool}
                  poolStat={item.poolStat}
                  accountPool={item.accountPool}
                  lppdRewards={item.lppdRewards}
                />
              );
            })}
          </PageCard>
        )}
      </Layout>
    );
  },
});
