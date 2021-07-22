import PageCard from "@/components/PageCard";
import AssetIcon from "@/components/AssetIcon";
import { usePoolStatItem } from "@/hooks/usePoolStatItem";
import { PoolStat, usePoolStats } from "@/hooks/usePoolStats";
import { useTokenIconUrl } from "@/hooks/useTokenIconUrl";
import router from "@/router";
import { computed, effect, ref, Ref } from "@vue/reactivity";
import { Component, defineComponent, PropType, SetupContext } from "vue";
import { RouterLink, RouterView } from "vue-router";
import {
  PoolPageAccountPool,
  usePoolPageData,
  COLUMNS,
} from "./usePoolPageData";
import { useUserPoolData } from "./useUserPoolData";
import { Asset, Network, Pool } from "../../../../core/src";
import { TokenIcon } from "@/components/TokenIcon";
import { useToken } from "@/hooks/useToken";
import { prettyNumber } from "@/utils/prettyNumber";
import { Button } from "@/components/Button/Button";
import { useCore } from "@/hooks/useCore";
import { formatAssetAmount } from "@/componentsLegacy/shared/utils";

export default defineComponent({
  name: "PoolPage",
  props: {},
  setup() {
    const data = usePoolPageData();
    const { config } = useCore();

    const poolDataWithUserData = computed(() => {
      const accountPoolMap = new Map<string, PoolPageAccountPool>();
      data.accountPools.value.forEach((pool) => {
        accountPoolMap.set(pool.lp.asset.symbol.toLowerCase(), pool);
      });

      return (
        data.stats.data?.value?.poolData.pools
          .map((pool) => {
            return {
              pool,
              accountPool: accountPoolMap.get(pool.symbol.toLowerCase()),
            };
          })
          // First sort by name
          .sort((a, b) => {
            if (a.pool.symbol === config.nativeAsset.symbol) return -1;
            if (b.pool.symbol === config.nativeAsset.symbol) return 1;
            return a.pool.symbol.localeCompare(b.pool.symbol);
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
          })
      );
    });

    return () => {
      return (
        <PageCard
          class="w-[790px]"
          heading="Pool"
          iconName="navigation/pool"
          headerAction={
            <RouterLink
              to={{ name: "AddLiquidity", params: {} }}
              class={[
                "flex flex-row items-center rounded-[4px] px-[17px] py-[8px] bg-accent-gradient mr-[5px] text-md",
              ]}
            >
              <AssetIcon icon="interactive/plus" size={20}></AssetIcon>
              <div class="ml-[4px] font-semibold">Add Liquidity</div>
            </RouterLink>
          }
          headerContent={
            <div class="w-full pb-[5px] mb-[-5px] w-full flex flex-row justify-start">
              {COLUMNS.map((column, index) => (
                <div key={column.name} class={[column.class, "opacity-50"]}>
                  {column.name}
                </div>
              ))}
            </div>
          }
        >
          {poolDataWithUserData.value
            ?.slice(0, 5)
            .map(({ pool, accountPool }) => {
              return (
                <UserPoolItem
                  key={pool.symbol}
                  poolStat={pool}
                  accountPool={accountPool}
                  allPools={data.stats.data?.value?.poolData.pools}
                />
              );
            })}
          <RouterView></RouterView>
        </PageCard>
      );
    };
  },
});

const UserPoolItem = defineComponent({
  props: {
    poolStat: {
      required: true,
      type: Object as PropType<PoolStat>,
    },
    accountPool: {
      required: false,
      type: Object as PropType<PoolPageAccountPool>,
    },
    allPools: {
      required: false,
      type: Array as PropType<PoolStat[]>,
    },
  },
  name: "UserPoolItem",
  setup(props) {
    const { store } = useCore();
    const isExpandedRef = ref(false);
    const currentPoolStat = computed(() => props.poolStat);

    const currentItemData = usePoolStatItem({ pool: currentPoolStat });
    const externalSymbolRef = computed(() => currentPoolStat.value.symbol);
    const accountPoolData = useUserPoolData({
      externalAsset: externalSymbolRef,
    });

    const rowanToken = useToken({
      network: ref(Network.SIFCHAIN),
      symbol: ref("rowan"),
    });
    const externalToken = useToken({
      network: ref(Network.SIFCHAIN),
      symbol: externalSymbolRef,
    });

    const nativeAmount = computed(
      () => store.pools[`${externalSymbolRef.value}_rowan`]?.amounts[0],
    );
    const externalAmount = computed(
      () => store.pools[`${externalSymbolRef.value}_rowan`]?.amounts[1],
    );

    const detailsRef = computed<[any, any][]>(() => [
      [
        `Total Pooled ${externalToken.value?.asset.symbol.toUpperCase()}`,
        <span class="font-mono">
          {prettyNumber(+formatAssetAmount(externalAmount.value), 5)}
        </span>,
      ],
      [
        `Total Pooled ROWAN`,
        <span class="font-mono">
          {prettyNumber(+formatAssetAmount(nativeAmount.value), 5)}
        </span>,
      ],
      [
        `Price of Token USD`,
        <span class="font-mono">
          {!!currentItemData.value.priceToken
            ? `$${currentItemData.value.priceToken}`
            : "..."}
        </span>,
      ],
      [
        "Arbitrage Opportunity",
        <span
          class={[
            "font-mono",
            +(currentItemData.value.arb || 0) < 0
              ? "text-danger-base"
              : "text-connected-base",
          ]}
        >
          {!!currentItemData.value.arb
            ? `${(+currentItemData.value.arb).toFixed(3)}%`
            : "..."}
        </span>,
      ],
      [
        "Pool Depth USD",
        <span class="font-mono">
          {!!currentItemData.value.poolDepth
            ? currentItemData.value.poolDepth
            : "..."}
        </span>,
      ],
      [
        "Trade Volume 24hr",
        <span class="font-mono">
          {!!currentItemData.value.volume
            ? currentItemData.value.volume
            : "..."}
        </span>,
      ],
    ]);

    return () => {
      return (
        <div class="w-full py-[10px] border-dashed border-b border-white border-opacity-40 last:border-none">
          <div
            onClick={() => {
              isExpandedRef.value = !isExpandedRef.value;
            }}
            class="cursor-pointer font-mono w-full flex justify-start items-center font-medium h-[32px] font-sans"
          >
            {COLUMNS.map((column) => {
              const content = (() => {
                switch (column.id) {
                  case "token": {
                    return (
                      <>
                        <TokenIcon
                          assetValue={rowanToken.value?.asset}
                          size={22}
                        />
                        <TokenIcon
                          assetValue={externalToken.value?.asset}
                          size={22}
                          class="ml-[4px]"
                        />
                        <div class="ml-[10px] uppercase font-sans">
                          ROWAN / {currentPoolStat.value.symbol.toUpperCase()}
                        </div>
                      </>
                    );
                  }
                  case "apy": {
                    return (
                      <div class="font-mono">
                        {+currentItemData.value.poolAPY || "..."}%
                      </div>
                    );
                  }
                  case "gainLoss": {
                    return (
                      <div
                        class={[
                          "font-mono",
                          !accountPoolData?.earnedRewards.value
                            ? ""
                            : accountPoolData?.earnedRewardsNegative.value
                            ? "text-danger-base"
                            : "text-connected-base",
                        ]}
                      >
                        {!accountPoolData.earnedRewards.value ? (
                          ""
                        ) : (
                          <>
                            {accountPoolData?.earnedRewardsNegative.value
                              ? "-"
                              : ""}
                            ${accountPoolData?.earnedRewards.value}
                          </>
                        )}
                      </div>
                    );
                  }
                  case "share": {
                    return (
                      <div class="font-mono">
                        {!!accountPoolData.myPoolShare.value
                          ? `${accountPoolData.myPoolShare.value}%`
                          : ""}
                      </div>
                    );
                  }
                }
              })();
              return (
                <div
                  key={column.name}
                  class={[column.class, "flex items-center"]}
                >
                  {content}
                </div>
              );
            })}
            <div class="flex flex-1 justify-end text-right">
              <button>
                <AssetIcon
                  size={24}
                  class={[
                    "text-accent-base transition-all",
                    isExpandedRef.value ? "rotate-180" : "rotate-0",
                  ]}
                  icon="interactive/chevron-down"
                ></AssetIcon>
              </button>
            </div>
          </div>
          {isExpandedRef.value && (
            <section
              class={[
                "flex flex-row justify-between bg-gray-base w-full rounded overflow-hidden opacity-0 pointer-events-none p-0 h-0 mt-0 transition-all",
                isExpandedRef.value &&
                  "h-[193px] opacity-100 pointer-events-auto !mt-[10px] p-[12px]",
              ]}
            >
              <div class="w-[482px] rounded-sm border border-solid border-gray-input_outline align self-center">
                {detailsRef.value.map(([key, value], index) => (
                  <div
                    key={index}
                    class="h-[28px] px-[6px] flex items-center justify-between text-sm font-medium border-b border-solid border-gray-input_outline last:border-none"
                  >
                    <span>{key}</span>
                    <span>{value}</span>
                  </div>
                ))}
              </div>
              <div class="p-[4px]">
                <Button.Inline
                  to={{
                    name: "AddLiquidity",
                    params: {
                      externalAsset: currentPoolStat.value.symbol.toLowerCase(),
                    },
                  }}
                  replace
                  class="w-[140px] !bg-black !text-accent-base"
                  icon="interactive/plus"
                >
                  Add Liquidity
                </Button.Inline>
                {!!accountPoolData.myPoolShare?.value && (
                  <Button.Inline
                    to={{
                      name: "RemoveLiquidity",
                      params: {
                        externalAsset: currentPoolStat.value.symbol.toLowerCase(),
                      },
                    }}
                    replace
                    class="w-[140px] !bg-black !text-accent-base mt-[6px]"
                    icon="interactive/minus"
                  >
                    Remove Liquidity
                  </Button.Inline>
                )}
              </div>
            </section>
          )}
        </div>
      );
    };
  },
});
