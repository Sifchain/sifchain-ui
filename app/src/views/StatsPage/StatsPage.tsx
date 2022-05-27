import { defineComponent, computed, Ref, ref } from "vue";
import PageCard from "@/components/PageCard";
import Layout from "@/components/Layout";
import { StatsPageState, useStatsPageData } from "./useStatsPageData";
import AssetIcon from "@/components/AssetIcon";
import { prettyNumber } from "@/utils/prettyNumber";
import { Tooltip } from "@/components/Tooltip";
import { SearchBox } from "@/components/SearchBox";
import { TokenNetworkIcon } from "@/components/TokenNetworkIcon/TokenNetworkIcon";
import RecyclerView from "@/components/RecyclerView";

export default defineComponent({
  name: "StatsPage",
  props: {},
  setup() {
    const { res, statsRef, state } = useStatsPageData({
      sortBy: "rewardApr",
      sortDirection: "desc",
    } as StatsPageState);

    const columns: Array<{
      name: string;
      message?: string | JSX.Element;
      sortBy: StatsPageState["sortBy"];
      class?: string;
      ref: Ref<HTMLElement | undefined>;
    }> = [
      {
        name: "Token",
        sortBy: "asset",
        class: "min-w-[120px] text-left",
        ref: ref<HTMLElement>(),
      },
      {
        name: "Price of Token",
        sortBy: "price",
        class: "min-w-[90px] text-right",
        ref: ref<HTMLElement>(),
      },
      {
        name: "Arbitrage Opportunity",
        message:
          "This is the arbitrage opportunity available based on a differential between the price of this token on Sifchain and its price on CoinMarketCap. If the percentage is green, it means the token is currently cheaper in Sifchain than CoinMarketCap.",
        sortBy: "arbitrage",
        class: "min-w-[120px] text-right",
        ref: ref<HTMLElement>(),
      },
      {
        name: "Pool TVL (USD)",
        sortBy: "tvl",
        class: "min-w-[120px] text-right",
        ref: ref<HTMLElement>(),
      },
      {
        name: "Total Volume (24hr)",
        sortBy: "volume",
        class: "min-w-[110px] text-right",
        ref: ref<HTMLElement>(),
      },
      {
        name: "Pool APR",
        sortBy: "poolApr",
        class: "min-w-[100px] text-right",
        ref: ref<HTMLElement>(),
        message: (
          <code class="text-xs">
            Pool reward APR = Total rewards distributed in current program /
            (Total blocks passed in current program * Current pool balance) *
            (Total blocks per year)
          </code>
        ),
      },
    ];
    const colStyles = computed(() => {
      return columns.map((col) => {
        return {
          width: `${col.ref.value?.getBoundingClientRect().width}px`,
        };
      });
    });

    const searchQuery = ref("");
    const finalStats = computed(() => {
      if (!searchQuery.value) return statsRef.value;
      return statsRef.value?.filter((item) => {
        return item.asset.symbol.toLowerCase().includes(searchQuery.value);
      });
    });

    return () => {
      if (res.isLoading.value) {
        return (
          <div class="absolute left-0 top-[180px] flex w-full justify-center">
            <div class="flex h-[80px] w-[80px] items-center justify-center rounded-lg bg-black bg-opacity-50">
              <AssetIcon icon="interactive/anim-racetrack-spinner" size={64} />
            </div>
          </div>
        );
      }

      return (
        <Layout>
          <PageCard
            class="w-screen"
            heading="Pool Stats"
            iconName="navigation/pool-stats"
            headerContent={
              <>
                <SearchBox
                  containerClass="mb-4"
                  value={searchQuery.value}
                  placeholder="Search Token..."
                  onInput={(e: Event) => {
                    searchQuery.value = (e.target as HTMLInputElement).value;
                  }}
                />

                <div class="height-[40px] flex items-center text-sm font-semibold">
                  {columns.map((column, index) => (
                    <div
                      style={colStyles.value[index]}
                      key={column.name}
                      class={[column.class]}
                    >
                      <div
                        class="inline-flex cursor-pointer items-center opacity-50 hover:opacity-60"
                        onClick={() => {
                          if (state.sortBy === column.sortBy) {
                            state.sortDirection =
                              state.sortDirection === "asc" ? "desc" : "asc";
                          } else {
                            state.sortDirection = "asc";
                          }
                          state.sortBy = column.sortBy;
                        }}
                      >
                        {column.message ? (
                          <Tooltip content={<>{column.message}</>}>
                            {column.name}
                          </Tooltip>
                        ) : (
                          column.name
                        )}
                        {state.sortBy === column.sortBy && (
                          <AssetIcon
                            icon="interactive/arrow-down"
                            class="h-[12px] w-[12px] transition-all"
                            style={{
                              transform:
                                state.sortDirection === "asc"
                                  ? "rotate(0deg)"
                                  : "rotate(180deg)",
                            }}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            }
          >
            <RecyclerView
              rowHeight={40}
              data={finalStats}
              emptyState={<div>...</div>}
              header={
                <div class="flex">
                  {columns.map((column, index) => (
                    <div
                      ref={column.ref}
                      class={["flex-1", column.class]}
                      key={column.name}
                    />
                  ))}
                </div>
              }
              renderItem={(item) => (
                <div
                  key={item.asset.symbol}
                  class="flex gap-2 border-b border-gray-600 p-2 py-4 font-mono last:border-b-0"
                >
                  <div class="flex-1 items-center">
                    <div class="flex items-center">
                      <TokenNetworkIcon
                        assetValue={item.asset}
                        size={22}
                        class="mr-2"
                      />
                      {(
                        item.asset.displaySymbol || item.asset.symbol
                      ).toUpperCase()}
                    </div>
                  </div>
                  <div class="flex-1 text-right">
                    ${prettyNumber(item.price, 3)}
                  </div>
                  <div
                    class={[
                      "text-right",
                      item.arbitrage == null
                        ? "text-gray-800"
                        : item.arbitrage < 0
                        ? `text-connected-base`
                        : `text-danger-base`,
                    ]}
                  >
                    {item.arbitrage == null
                      ? "N/A"
                      : `${prettyNumber(Math.abs(item.arbitrage))}%`}
                  </div>
                  <div class="flex-1 text-right">${prettyNumber(item.tvl)}</div>
                  <div class="flex-1 text-right">
                    ${prettyNumber(item.volume)}
                  </div>
                  <div class="flex-1 text-right">{item.poolApr}%</div>
                </div>
              )}
            />
          </PageCard>
        </Layout>
      );
    };
  },
});
