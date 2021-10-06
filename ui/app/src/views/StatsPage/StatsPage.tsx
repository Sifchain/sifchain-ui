import { defineComponent, computed, Ref, ref } from "vue";
import { Asset, IAsset } from "@sifchain/sdk";
import PageCard from "@/components/PageCard";
import Layout from "@/componentsLegacy/Layout/Layout";
import { TokenIcon } from "@/components/TokenIcon";
import { StatsPageState, useStatsPageData } from "./useStatsPageData";
import AssetIcon from "@/components/AssetIcon";
import { prettyNumber } from "@/utils/prettyNumber";
import { Tooltip } from "@/components/Tooltip";

export default defineComponent({
  name: "StatsPage",
  props: {},
  setup() {
    const { res, statsRef, state } = useStatsPageData({
      sortBy: "rewardApy",
      sortDirection: "desc",
    } as StatsPageState);

    const columns: Array<{
      name: string;
      message?: string;
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
        name: "Pool Depth (USD)",
        sortBy: "depth",
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
        name: "Pool APY",
        sortBy: "poolApy",
        class: "min-w-[80px] text-right",
        ref: ref<HTMLElement>(),
      },
      {
        name: "Reward APY",
        sortBy: "rewardApy",
        class: "min-w-[80px] text-right",
        ref: ref<HTMLElement>(),
      },
      {
        name: "Total APY",
        message: "Combined Pool & Reward APY's",
        sortBy: "totalApy",
        class: "min-w-[80px] text-right",
        ref: ref<HTMLElement>(),
      },
    ];
    const colStyles = computed(() => {
      return columns.map((col) => {
        return {
          width: `${col.ref.value?.getBoundingClientRect().width}px`,
        };
      });
    });

    return () => {
      if (res.isLoading.value) {
        return (
          <div class="absolute left-0 top-[180px] w-full flex justify-center">
            <div class="flex items-center justify-center bg-black bg-opacity-50 rounded-lg h-[80px] w-[80px]">
              <AssetIcon icon="interactive/anim-racetrack-spinner" size={64} />
            </div>
          </div>
        );
      }

      return (
        <Layout>
          <PageCard
            heading="Pool Stats"
            iconName="navigation/pool-stats"
            class="!w-[940px] !min-w-[940px] !max-w-[940px]"
            withOverflowSpace
            headerContent={
              <div class="height-[40px] flex items-center text-sm font-semibold">
                {columns.map((column, index) => (
                  <div
                    style={colStyles.value[index]}
                    key={column.name}
                    class={[column.class]}
                  >
                    <div
                      class="inline-flex items-center cursor-pointer opacity-50 hover:opacity-60"
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
                          class="transition-all w-[12px] h-[12px]"
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
            }
          >
            <table class="w-full">
              <thead>
                <tr>
                  {columns.map((column, index) => (
                    <td
                      ref={column.ref}
                      class={[column.class]}
                      key={column.name}
                    />
                  ))}
                </tr>
              </thead>
              <tbody class="w-full text-base font-medium">
                {statsRef.value.map((item) => {
                  return (
                    <tr
                      key={item.asset.symbol}
                      class="align-middle h-8 border-dashed border-b border-white border-opacity-40 last:border-transparent hover:opacity-80"
                    >
                      <td class="align-middle">
                        <div class="flex items-center">
                          <TokenIcon
                            assetValue={item.asset}
                            size={22}
                            class="mr-[10px]"
                          />
                          {(
                            item.asset.displaySymbol || item.asset.symbol
                          ).toUpperCase()}
                        </div>
                      </td>
                      <td class="align-middle text-right text-mono">
                        ${prettyNumber(item.price, 3)}
                      </td>
                      <td
                        class={[
                          "align-middle text-mono text-right",
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
                      </td>
                      <td class="align-middle text-right text-mono">
                        ${prettyNumber(item.depth)}
                      </td>
                      <td class="align-middle text-right text-mono">
                        ${prettyNumber(item.volume)}
                      </td>
                      <td class="align-middle text-right text-mono">
                        {item.poolApy}%
                      </td>
                      <td class="align-middle text-right text-mono">
                        {item.rewardApy}%
                      </td>{" "}
                      <td class="align-middle text-right text-mono">
                        {item.totalApy}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </PageCard>
        </Layout>
      );
    };
  },
});
