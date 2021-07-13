import PageCard from "@/components/PageCard";
import AssetIcon from "@/componentsLegacy/utilities/AssetIcon";
import { usePoolStatItem } from "@/hooks/usePoolStatItem";
import { PoolStat } from "@/hooks/usePoolStats";
import { useTokenIconUrl } from "@/hooks/useTokenIconUrl";
import { computed, ref, Ref } from "@vue/reactivity";
import { Component, defineComponent, PropType, SetupContext } from "vue";
import { RouterLink, RouterView } from "vue-router";
import { PoolPageAccountPool, usePoolPageData } from "./usePoolPageData";
import { useUserPoolData } from "./useUserPoolData";

export default defineComponent({
  name: "PoolPage",
  props: {},
  setup() {
    const data = usePoolPageData();
    return () => {
      return (
        <PageCard
          heading="Pool"
          iconName="navigation/pool"
          headerAction={
            <RouterLink
              to={{ name: "AddLiquidity", params: {} }}
              class={[
                "flex flex-row items-center rounded-[4px] px-[17px] py-[8px] bg-accent-gradient mr-[5px] text-[16px]",
              ]}
            >
              <AssetIcon icon="interactive/plus" size={20}></AssetIcon>
              <div class="ml-[4px] font-semibold">Add Liquidity</div>
            </RouterLink>
          }
        >
          <div class="overflow-y-scroll w-full">
            <div class="w-full flex justify-start gap-[10px] capitalize text-right opacity-50 font-medium">
              <div class={`min-w-[196px] text-left`}>Token Pair</div>
              <div class={`min-w-[118px]`}>pool APY</div>
              <div class={`min-w-[130px]`}>Gain/Loss</div>
              <div class={`min-w-[142px]`}>Your Pool Share</div>
              <div class={`min-w-[24px]`}></div>
            </div>
            <div>
              {data.accountPools.value.map((pool) => {
                return (
                  <UserPoolItem
                    key={pool.pool.symbol()}
                    pool={pool}
                    allPools={data.stats.data?.value?.poolData.pools}
                  ></UserPoolItem>
                );
              })}
            </div>
          </div>
        </PageCard>
      );
    };
  },
});

const UserPoolItem = defineComponent({
  props: {
    pool: {
      required: true,
      type: Object as PropType<PoolPageAccountPool>,
    },
    allPools: {
      required: false,
      type: Array as PropType<PoolStat[]>,
    },
  },
  name: "UserPoolItem",
  setup(props) {
    const isExpandedRef = ref(false);
    const currentPoolStat = computed(() => {
      return props.allPools?.find((p) =>
        props.pool?.pool
          ?.symbol()
          .toLowerCase()
          .includes(p.symbol.toLowerCase()),
      );
    });
    const currentItemData = usePoolStatItem({ pool: currentPoolStat });
    const userPoolData = useUserPoolData({
      externalAsset: computed(() => props.pool.lp.asset.symbol ?? ""),
    });
    const rowanIconUrl = useTokenIconUrl({
      symbol: computed(() => "rowan"),
    });
    const fromAssetIconUrl = useTokenIconUrl({
      symbol: computed(() => "clink"),
    });
    const PoolDetailRow = (props: {
      title?: string;
      info?: string;
      infoClass?: string;
    }) => {
      return (
        <div class="bg-black px-[6px] py-[2px] flex rounded-[2px]">
          {props.title}
          <div class={["ml-auto font-mono", props.infoClass]}>{props.info}</div>
        </div>
      );
    };
    return () => {
      return (
        <>
          <div class="w-full">
            <div
              onClick={() => {
                isExpandedRef.value = !isExpandedRef.value;
              }}
              class="cursor-pointer z-10 overflow-hidden relative font-mono w-full py-[10px] flex justify-start items-center gap-[10px] pb-[18px] capitalize text-right font-medium"
            >
              <div
                class={`min-w-[196px] text-left font-sans font-medium flex flex-row`}
              >
                <div class="flex flex-row w-[48px]">
                  <img
                    class="max-h-[22px] max-w-[22px]"
                    src={rowanIconUrl.value}
                    alt=""
                  />
                  <img
                    class="max-h-[22px] max-w-[22px] ml-[4px]"
                    src={fromAssetIconUrl.value}
                    alt=""
                  />
                </div>
                <div class="ml-[10px]">ROWAN / {props.pool.lp.asset.label}</div>
              </div>
              <div class={`min-w-[118px]`}>
                {+currentItemData.value.poolAPY || "..."}%
              </div>
              <div class={`min-w-[130px] text-danger-base`}>
                {" "}
                ${userPoolData?.earnedRewardsNegative.value ? "-" : ""}
                {userPoolData?.earnedRewards.value}
              </div>
              <div class={`min-w-[142px]`}>
                {userPoolData.myPoolShare.value}%
              </div>
              <div class={`min-w-[0px] ml-auto`}>
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
            <div
              class={[
                "flex z-0 transition-all origin-top overflow-y-scroll flex-row items-center bg-[#191919] pa-[20px] w-full rounded-[6px] py-[8px] pl-[7px]",
                isExpandedRef.value
                  ? ""
                  : "h-0 scale-y-0 p-0 pointer-events-none",
              ]}
            >
              <div class="flex flex-col w-full gap-[4px] text-left text-[12px]">
                <PoolDetailRow
                  title={`Total Pooled ${userPoolData.fromSymbol.value?.toUpperCase()}`}
                  info={userPoolData.fromTotalValue.value}
                />
                <PoolDetailRow
                  title={`Total Pooled ${userPoolData.toSymbol.value?.toUpperCase()}`}
                  info={userPoolData.toTotalValue.value}
                />
                <PoolDetailRow
                  title={`Price of Token USD`}
                  info={"$" + currentItemData.value.priceToken}
                />
                <PoolDetailRow
                  title={`Arbitrage Opportunity`}
                  info={(currentItemData.value.arb ?? "...") + "%"}
                  infoClass={
                    !currentItemData.value.arb
                      ? ""
                      : +currentItemData.value.arb < 0
                      ? "text-danger-base"
                      : "text-connected-base"
                  }
                />
                <PoolDetailRow
                  title={`Pool Depth USD`}
                  info={"$" + (currentItemData.value.poolDepth || "...")}
                />
                <PoolDetailRow
                  title={`Trade Volume 24hr`}
                  info={"$" + (currentItemData.value.volume || "...")}
                />
              </div>
              <div class="bg-black p-[6px] min-w-[200px] gap-[6px] mx-[8px] rounded-[6px] flex items-center">
                <button class="w-1/2 flex gap-[4px]  items-center px-[8px] py-[6px] rounded-[6px] text-accent-base text-[12px] font-semibold bg-[#191919]">
                  <AssetIcon size={20} icon="interactive/plus"></AssetIcon>
                  <div>Add</div>
                </button>
                <button class="w-1/2 flex gap-[4px] items-center px-[8px] py-[6px] rounded-[6px] text-accent-base text-[12px] font-semibold bg-[#191919]">
                  <AssetIcon size={20} icon="interactive/minus"></AssetIcon>
                  <div>Remove</div>
                </button>{" "}
              </div>
            </div>
          </div>
          <RouterView></RouterView>
        </>
      );
    };
  },
});
