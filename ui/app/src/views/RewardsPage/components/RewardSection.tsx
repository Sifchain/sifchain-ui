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

const REWARD_TYPE_DISPLAY_DATA = {
  lm: {
    heading: ".39 Liquidity Mining",
    icon: "navigation/pool" as IconName,
    description:
      "Earn additional rewards by providing liquidity to any of Sifchain's pools.",
  },
  vs: {
    heading: ".39 Validator Subsidy",
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
        <div class="text-left text-lg flex items-center">
          <AssetIcon
            icon={displayData.value.icon}
            size={20}
            class="mr-[10px]"
          />
          {displayData.value.heading}
        </div>
        <div class="flex text-sm items-center gap-[10px]">
          <div class="opacity-50">
            Users could earn additional rewards by{" "}
            {props.rewardType === "vs"
              ? "staking a node or delegating to a staked node"
              : "providing liquidity to any of Sifchain's pools"}{" "}
            within our .39 environment. Participants are now fully determined at
            this point in time.
          </div>

          <div class="flex items-center justify-center">
            <div class="p-[6px] w-[150px] bg-black rounded-lg">
              <Button.Inline
                class="w-full no-underline"
                href={
                  "https://docs.sifchain.finance/resources/rewards-programs#liquidity-mining-and-validator-subsidy-rewards-on-sifchain"
                }
                target="_blank"
                icon="interactive/circle-info"
                rel="noopener noreferrer"
              >
                Learn More
              </Button.Inline>
              <Button.Inline
                class="w-full mt-[6px]"
                href={
                  "https://docs.google.com/spreadsheets/d/1f-ibZyx5O2f1wsNxvi56Kg8fkdys_DVmwhf7mjKDrDU/edit#gid=686570385"
                }
                target="_blank"
                icon="navigation/rewards"
                rel="noopener noreferrer"
                active
              >
                Payout Schedule
              </Button.Inline>
            </div>
          </div>
        </div>
      </>
    );
  },
});
