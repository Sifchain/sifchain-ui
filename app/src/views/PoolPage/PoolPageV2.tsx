import { computed, defineComponent, ref } from "vue";
import { RouterView } from "vue-router";

import { Button } from "@/components/Button/Button";
import Layout from "@/components/Layout";
import PageCard from "@/components/PageCard";
import { SearchBox } from "@/components/SearchBox";
import { flagsStore, isAssetFlaggedDisabled } from "@/store/modules/flags";
import { usePoolPageData } from "./usePoolPageData";

export default defineComponent({
  name: "PoolsPage",
  setup() {
    const searchQuery = ref("");
    const sortBy = ref<"token" | "rewardApr">("rewardApr");

    const { isLoaded, allPoolsData } = usePoolPageData();

    const sanitizedData = computed(() => {
      return (
        (allPoolsData.value ?? [])
          .filter((item) => {
            const asset = item.pool.externalAmount?.asset;
            if (!asset) return;

            if (isAssetFlaggedDisabled(asset)) return false;

            if (
              searchQuery.value.length > 0 &&
              !asset.symbol.toLowerCase().includes(searchQuery.value)
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
            if (sortBy.value === "token") {
              const aAsset = a.pool.externalAmount!.asset;
              const bAsset = b.pool.externalAmount!.asset;
              return aAsset.displaySymbol.localeCompare(bAsset.displaySymbol);
            } else if (sortBy.value === "rewardApr") {
              return (
                (b.poolStat?.rewardApr ?? 0) - (a.poolStat?.rewardApr ?? 0)
              );
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
          })
      );
    });

    return () => (
      <Layout>
        <RouterView
          name={
            flagsStore.state.allowEmptyLiquidityAdd
              ? undefined
              : !isLoaded.value
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
              value={searchQuery.value}
              onInput={(e: Event) => {
                searchQuery.value = (e.target as HTMLInputElement).value;
              }}
            />
          }
        >
          {sanitizedData.value.map(() => (
            <div class=""></div>
          ))}
        </PageCard>
      </Layout>
    );
  },
});
