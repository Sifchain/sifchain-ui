import PageCard from "@/components/PageCard";
import AssetIcon from "@/components/AssetIcon";
import { usePoolStatItem } from "@/hooks/usePoolStatItem";
import { PoolStat } from "@/hooks/usePoolStats";
import { computed, ref } from "@vue/reactivity";
import { defineComponent, PropType } from "vue";
import Layout from "@/componentsLegacy/Layout/Layout";
import { RouterView } from "vue-router";
import {
  PoolPageAccountPool,
  usePoolPageData,
  COLUMNS,
} from "./usePoolPageData";
import { useUserPoolData } from "./useUserPoolData";
import { Asset, Network } from "@sifchain/sdk";
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
            return Asset.get(a.pool.symbol).displaySymbol.localeCompare(
              Asset.get(b.pool.symbol).displaySymbol,
            );
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
        <Layout>
          {/* Disable child routes (add/remove liq modals) while data isnt loaded  */}
          <RouterView
            name={
              !poolDataWithUserData.value?.length
                ? "DISABLED_WHILE_LOADING"
                : undefined
            }
          />
          {!poolDataWithUserData.value?.length ? (
            <div class="absolute left-0 top-[180px] w-full flex justify-center">
              <div class="flex items-center justify-center bg-black bg-opacity-50 rounded-lg h-[80px] w-[80px]">
                <AssetIcon
                  icon="interactive/anim-racetrack-spinner"
                  size={64}
                />
              </div>
            </div>
          ) : (
            <PageCard
              class="w-[790px]"
              heading="Pool"
              iconName="navigation/pool"
              withOverflowSpace
              headerAction={
                <Button.Inline
                  to={{ name: "AddLiquidity", params: {} }}
                  active
                  replace
                  class={["!h-[40px] px-[17px] text-md"]}
                  icon="interactive/plus"
                >
                  <div class="font-semibold">Add Liquidity</div>
                </Button.Inline>
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
              {poolDataWithUserData.value?.map(({ pool, accountPool }) => {
                return (
                  <UserPoolItem
                    key={pool.symbol}
                    poolStat={pool}
                    accountPool={accountPool}
                    allPools={data.stats.data?.value?.poolData.pools}
                  />
                );
              })}
            </PageCard>
          )}
        </Layout>
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
    const { store, poolFinder } = useCore();
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
      tokenListParams: {
        showDecomissionedAssets: true,
      },
    });

    const pool = computed(
      () => poolFinder(externalSymbolRef.value, "rowan")?.value,
    );
    const nativeAmount = computed(() =>
      pool.value?.amounts.find((a) => a.symbol === "rowan"),
    );
    const externalAmount = computed(() =>
      pool.value?.amounts.find((a) => a.symbol !== "rowan"),
    );

    const detailsRef = computed<[any, any][]>((): [string, JSX.Element][] => [
      [
        `Network Pooled ${externalToken.value?.asset.displaySymbol.toUpperCase()}`,
        <span class="font-mono">
          {!!externalAmount.value &&
            prettyNumber(+formatAssetAmount(externalAmount.value), 5)}
        </span>,
      ],
      [
        `Network Pooled ROWAN`,
        <span class="font-mono">
          {!!nativeAmount.value &&
            prettyNumber(+formatAssetAmount(nativeAmount.value), 5)}
        </span>,
      ],
      [
        `Price of Token USD`,
        <span class="font-mono">
          {currentItemData.value.priceToken != null
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
          {currentItemData.value.arb != null
            ? `${(+currentItemData.value.arb).toFixed(3)}%`
            : "..."}
        </span>,
      ],
      [
        "Pool Depth USD",
        <span class="font-mono">
          {currentItemData.value.poolDepth != null
            ? currentItemData.value.poolDepth
            : "..."}
        </span>,
      ],
      [
        "Trade Volume 24hr",
        <span class="font-mono">
          {currentItemData.value.volume != null
            ? currentItemData.value.volume
            : "..."}
        </span>,
      ],
    ]);

    return () => {
      return (
        <div class="w-full py-[10px] border-dashed border-b border-white border-opacity-40 last:border-none group">
          <div
            onClick={() => {
              isExpandedRef.value = !isExpandedRef.value;
            }}
            class="cursor-pointer font-mono w-full flex justify-start items-center font-medium h-[32px] font-sans group-hover:opacity-80"
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
                          ROWAN /{" "}
                          {(
                            externalToken.value?.asset.displaySymbol ||
                            externalToken.value?.asset.symbol ||
                            ""
                          ).toUpperCase()}
                        </div>
                      </>
                    );
                  }
                  case "apy": {
                    return (
                      <div class="font-mono">
                        {currentItemData.value.poolAPY != null
                          ? (+currentItemData.value.poolAPY || 0).toFixed(2)
                          : "..."}
                        %
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
                {!externalAmount.value?.asset.decommissioned && (
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
                )}
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
