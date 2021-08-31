import AssetIcon, { IconName } from "@/components/AssetIcon";
import { TokenIcon } from "@/components/TokenIcon";
import { Asset, Amount } from "@sifchain/sdk";
import { format } from "@sifchain/sdk/src/utils/format";
import {
  CryptoeconomicsRewardType,
  CryptoeconomicsUserData,
} from "@sifchain/sdk/src/services/CryptoeconomicsService";
import { Tooltip } from "@/components/Tooltip";
import { Button } from "@/components/Button/Button";
import { defineComponent, PropType, computed } from "vue";
import { useCore } from "@/hooks/useCore";
import { accountStore } from "@/store/modules/accounts";

const REWARD_TYPE_DISPLAY_DATA = {
  lm: {
    heading: ".42 Liquidity Mining",
    icon: "navigation/pool" as IconName,
    description:
      "Earn additional rewards by providing liquidity to any of Sifchain's Cosmos IBC token pools.",
  },
  vs: {
    heading: "Validator Subsidy",
    icon: "interactive/lock" as IconName,
    description:
      "Earn additional rewards by staking a node or delegating to a staked node.",
  },
};

const formatRowanNumber = (n?: number) => {
  if (n == null) return "0";
  return (
    format(Amount(String(n)), {
      mantissa: 4,
      zeroFormat: "0",
    }) || "0"
  );
};

export const RewardSection = defineComponent({
  name: "RewardSection",
  props: {
    rewardType: {
      type: String as PropType<CryptoeconomicsRewardType>,
      required: true,
    },
    data: { type: Object as PropType<CryptoeconomicsUserData>, required: true },
    alreadyClaimed: { type: Boolean, required: true },
    infoLink: { type: String, required: true },
    onClaimIntent: { type: Function as PropType<() => void>, required: true },
  },
  setup(props) {
    const { store } = useCore();
    const displayData = computed(
      () => REWARD_TYPE_DISPLAY_DATA[props.rewardType],
    );

    const sifConnected = accountStore.refs.sifchain.connected.computed();

    const details = computed(() =>
      [
        {
          hide: props.rewardType !== "vs",
          name: "Reserved Comission Rewards",
          tooltip:
            "These are rewards you have earned from your delegators, but are not yet claimable due to either: a) your delegators not claiming their portion of these rewards yet or b) those rewards for your delegators not reaching full maturity yet.  Once one of these actions happen, these rewards will be considered claimable for you.",
          amount:
            props.data?.user
              ?.currentTotalCommissionsOnClaimableDelegatorRewards,
        },
        {
          name: "Pending Dispensation",
          tooltip:
            "This is the amount that will be dispensed on Friday. Any new claimable amounts will need to be claimed after the next dispensation.",
          amount:
            props.data?.user?.claimedCommissionsAndRewardsAwaitingDispensation,
        },
        {
          name: "Dispensed Rewards",
          tooltip: "Rewards that have already been dispensed.",
          amount: props.data?.user?.dispensed,
        },
      ].filter((item) => !item.hide),
    );

    return () => (
      <>
        <div class="mt-[10px] text-lg flex">
          <div class="text-left w-[250px] flex items-center">
            <AssetIcon
              icon={displayData.value.icon}
              size={20}
              class="mr-[10px]"
            />
            {displayData.value.heading}
          </div>

          <div class="text-right justify-end flex-1 font-mono flex items-center">
            {/* Full Amount */}
            {formatRowanNumber(
              props.data?.user?.totalCommissionsAndRewardsAtMaturity,
            )}
            <TokenIcon
              assetValue={Asset.get("rowan")}
              size={20}
              class="ml-[10px]"
            />
          </div>
          <div class="w-[300px] text-right justify-end font-mono flex items-center">
            {/* Claimable Amount */}
            {formatRowanNumber(
              props.data?.user?.totalClaimableCommissionsAndClaimableRewards,
            )}
            <TokenIcon
              assetValue={Asset.get("rowan")}
              size={20}
              class="ml-[10px]"
            />
          </div>
        </div>
        <div class="mt-[10px] flex justify-between text-sm bg-gray-base py-2 px-3">
          <div class="flex flex-col justify-between">
            <div class="opacity-50 mb-[20px]">
              {displayData.value.description}
            </div>
            {/* Claimable Amount */}

            {details.value.map((detail, index) => (
              <div
                key={index}
                class="mt-[6px] first:mt-0 flex w-[400px] justify-between"
              >
                <span class="whitespace-nowrap flex items-center">
                  {detail.name}
                  {!!detail.tooltip && (
                    <Button.InlineHelp>{detail.tooltip}</Button.InlineHelp>
                  )}
                </span>
                <span class="w-[250px] text-right">
                  {formatRowanNumber(detail.amount)}
                </span>
              </div>
            ))}
          </div>

          <div class="flex items-center justify-center">
            <div class="p-[6px] w-[140px] bg-black rounded-lg">
              <Button.Inline
                class="w-full no-underline"
                icon="interactive/circle-info"
                href={props.infoLink}
                target="_blank"
                disabled={!sifConnected.value}
                rel="noopener noreferrer"
              >
                Learn More
              </Button.Inline>{" "}
              <Button.Inline
                onClick={() => props.onClaimIntent()}
                class="w-full mt-[6px]"
                icon="navigation/rewards"
                active
                disabled={
                  true ||
                  !props.data?.user
                    ?.totalClaimableCommissionsAndClaimableRewards ||
                  props.alreadyClaimed
                }
              >
                {props.alreadyClaimed ? "Pending Claim" : "Claim Reward"}
              </Button.Inline>
            </div>
          </div>
        </div>
      </>
    );
  },
});
