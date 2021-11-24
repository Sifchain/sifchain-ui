import AssetIcon, { IconName } from "@/components/AssetIcon";
import { TokenIcon } from "@/components/TokenIcon";
import Layout from "@/componentsLegacy/Layout/Layout";
import { useRowanPrice } from "@/componentsLegacy/RowanPrice/useRowanPrice";
import { formatAssetAmount } from "@/componentsLegacy/shared/utils";
import { useChains, useNativeChain } from "@/hooks/useChains";
import { useCore } from "@/hooks/useCore";
import { usePoolStats } from "@/hooks/usePoolStats";
import { accountStore } from "@/store/modules/accounts";
import { prettyNumber } from "@/utils/prettyNumber";
import { AssetAmount, IBCChainConfig, Network } from "@sifchain/sdk";
import { defineComponent, SetupContext, watch } from "@vue/runtime-core";
import { HTMLAttributes } from "@vue/runtime-dom";
import { ref } from "vue";
import { usePoolPageData } from "../PoolPage/usePoolPageData";
import { useUserPoolData } from "../PoolPage/useUserPoolData";
import { useRewardsPageData } from "../RewardsPage/useRewardsPageData";

function Card(
  props: HTMLAttributes & {
    heading: string;
    icon: IconName;
  },
  ctx: SetupContext,
) {
  return (
    <span
      {...props}
      class={["whitespace-pre bg-black rounded-lg p-[20px]", props.class]}
    >
      <div class="flex items-center mb-[10px] text-accent-base">
        <AssetIcon
          icon={props.icon}
          size={20}
          class="flex-shrink-0 sm:hidden mr-[4px]"
        />
        <div class="text-lg sm:text-[3.5vw]">{props.heading}</div>
      </div>

      {ctx.slots?.default?.()}
    </span>
  );
}

export const DashboardPage = defineComponent({
  name: "DashboardPage",
  setup() {
    const stakedAmountRef = ref<number | undefined>();
    watch(
      accountStore.refs.sifchain.connected.computed(),
      async (connected) => {
        if (!connected) return;
        const config = useNativeChain().chainConfig as IBCChainConfig;
        const res = await fetch(
          `${config.restUrl}/staking/delegators/${accountStore.state.sifchain.address}/delegations`,
        );
        const json: {
          result: [
            {
              balance: { amount: string; denom: string };
            },
          ];
        } = await res.json();

        let stakedAmount = 0;
        json.result.forEach((item) => {
          stakedAmount += +formatAssetAmount(
            AssetAmount("rowan", item.balance.amount),
          );
        });
        stakedAmountRef.value = stakedAmount;
      },
      {
        immediate: true,
      },
    );
    return {
      stakedAmount: stakedAmountRef,
      poolData: usePoolPageData(),
      rowanPrice: useRowanPrice(),
      rewardsData: useRewardsPageData(),
    };
  },
  computed: {
    dataReady(): boolean {
      return Boolean(
        accountStore.state.sifchain.hasLoadedBalancesOnce &&
          this.poolData.poolStatLookup.value,
      );
    },

    userBalanceUsd(): number | undefined {
      if (!this.dataReady) return;

      const lookup = this.poolData.poolStatLookup.value!;
      return accountStore.state.sifchain.balances.reduce(
        (balanceUsd, assetAmount) => {
          return (
            balanceUsd +
            parseFloat(formatAssetAmount(assetAmount)) *
              (+lookup[assetAmount.symbol]?.priceToken || 0)
          );
        },
        0,
      );
    },
    userPooledUsd(): number | undefined {
      if (!this.dataReady) return;
      return this.poolData.allPoolsData.value.reduce(
        (userPooledAmount, item) => {
          const { accountPool, poolStat } = item;
          if (!accountPool || !poolStat || this.rowanPrice.isLoading.value) {
            return userPooledAmount;
          }

          const externalAmount = AssetAmount(
            accountPool.lp.asset,
            accountPool.lp.externalAmount,
          );
          const nativeAmount = AssetAmount(
            useChains().get(Network.SIFCHAIN).nativeAsset,
            accountPool.lp.nativeAmount,
          );
          const formattedExternal = formatAssetAmount(externalAmount);
          const formattedNative = formatAssetAmount(nativeAmount);

          return (
            userPooledAmount +
            (parseFloat(formattedExternal) *
              parseFloat(poolStat.priceToken || "0") +
              parseFloat(formattedNative) *
                parseFloat(this.rowanPrice.data.value || "0"))
          );
        },
        0,
      );
    },
    earnedRewards(): number | undefined {
      if (this.rewardsData.isLoading.value) return;
      const rewardTotals = this.rewardsData?.rewardTotals.value;
      if (!rewardTotals) return;
      const total =
        rewardTotals.dispensedRewards +
        rewardTotals.claimableRewards +
        rewardTotals.pendingRewards;
      if (!total) return;
      return total;
    },
  },
  render(): JSX.Element {
    const topRow = [
      {
        icon: "navigation/pool",
        heading: "Balance",
        content:
          this.userBalanceUsd == null
            ? " "
            : `$${prettyNumber(this.userBalanceUsd, 2)}`,
      },
      {
        icon: "navigation/pool",
        heading: "Pooled",
        content:
          this.userPooledUsd == null
            ? " "
            : `$${prettyNumber(this.userPooledUsd, 2)}`,
      },
      {
        icon: "navigation/pool",
        heading: "Staked",
        content:
          this.stakedAmount == null ? (
            " "
          ) : (
            <div class="flex items-center">
              <TokenIcon
                assetValue={useNativeChain().nativeAsset}
                size={24}
                class="mr-[6px]"
              />
              {prettyNumber(this.stakedAmount, 0)}
            </div>
          ),
      },
      {
        icon: "navigation/pool",
        heading: "Rewards",
        content:
          this.earnedRewards == null ? (
            " "
          ) : (
            <div class="flex items-center">
              <TokenIcon
                assetValue={useNativeChain().nativeAsset}
                size={24}
                class="mr-[6px]"
              />
              {prettyNumber(this.earnedRewards, 0)}
            </div>
          ),
      },
    ];
    return (
      <Layout>
        <div class="mt-[42px]">
          <div class="flex sm:flex-wrap gap-2 items-start sm:justify-center">
            {topRow.map((item, index) => (
              <Card
                key={index}
                heading={item.heading}
                icon={item.icon as IconName}
                class="w-[180px] sm:w-[45vw]"
              >
                <span class="text-[24px] sm:text-[4vw]">{item.content}</span>
              </Card>
            ))}
          </div>
        </div>
      </Layout>
    );
  },
});
