import AssetIcon from "@/components/AssetIcon";
import { Button } from "@/components/Button/Button";
import PageCard from "@/components/PageCard";
import Layout from "@/componentsLegacy/Layout/Layout";
import { useChains } from "@/hooks/useChains";
import { useCore } from "@/hooks/useCore";
import { Network } from "@sifchain/sdk";
import { defineComponent } from "vue";
import { RouterView } from "vue-router";
import {
  COLUMNS,
  PoolDataItem,
  PoolPageColumnId,
  usePoolPageData,
} from "./usePoolPageData";
import PoolItem from "./PoolItem";

export default defineComponent({
  name: "PoolsPage",
  data() {
    return {
      sortBy: "rewardApy" as PoolPageColumnId,
      sortReverse: false,
    };
  },
  setup() {
    const data = usePoolPageData();
    return {
      allPoolsData: data.allPoolsData,
      isLoaded: data.isLoaded,
    };
  },
  computed: {
    sanitizedPoolData() {
      if (!this.isLoaded) return [];

      const result = this.allPoolsData
        .filter((item: PoolDataItem) => {
          const asset = item.pool.externalAmount?.asset;
          if (!asset) return;

          return (
            !asset.decommissioned ||
            // Show decommissioned assets if user has a share.
            (asset.decommissioned && item.accountPool?.lp.units)
          );
        })
        // First sort by name or apy
        .sort((a: PoolDataItem, b: PoolDataItem) => {
          if (this.$data.sortBy === "token") {
            const aAsset = a.pool.externalAmount!.asset;
            const bAsset = b.pool.externalAmount!.asset;
            return aAsset.displaySymbol.localeCompare(bAsset.displaySymbol);
          } else if (this.$data.sortBy === "rewardApy") {
            return (
              parseFloat(b.poolStat?.rewardAPY || "0") -
              parseFloat(a.poolStat?.rewardAPY || "0")
            );
          } else {
            return (
              parseFloat(b.poolStat?.poolAPY || "0") -
              parseFloat(a.poolStat?.poolAPY || "0")
            );
          }
        })
        // Then sort by balance
        .sort((a: PoolDataItem, b: PoolDataItem) => {
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
        result.reverse();
      }
      return result;
    },
  },

  render() {
    return (
      <Layout>
        <RouterView
          name={!this.isLoaded ? "DISABLED_WHILE_LOADING" : undefined}
        />
        {!this.isLoaded ? (
          <div class="absolute left-0 top-[180px] w-full flex justify-center">
            <div class="flex items-center justify-center bg-black bg-opacity-50 rounded-lg h-[80px] w-[80px]">
              <AssetIcon icon="interactive/anim-racetrack-spinner" size={64} />
            </div>
          </div>
        ) : (
          <PageCard
            class="w-[900px] !max-w-[1000px]"
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
                      "opacity-50 flex items-center",
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
                        "pl-[2px] mr-[-22px]",
                        (!column.sortable || this.sortBy !== column.id) &&
                          "invisible",
                        this.sortReverse && "rotate-180",
                      ]}
                    />
                  </div>
                ))}
              </div>
            }
          >
            {this.sanitizedPoolData.map((item: PoolDataItem) => {
              return (
                <PoolItem
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
