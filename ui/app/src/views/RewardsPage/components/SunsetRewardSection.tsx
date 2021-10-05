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
  lm_harvest: {
    heading: "Sif's Harvest (closed)",
    icon: "navigation/pool" as IconName,
    description:
      "Earn additional rewards by providing liquidity to any of Sifchain's pools.",
  },
  lm: {
    heading: ".39 Liquidity Mining (closed)",
    icon: "navigation/pool" as IconName,
    description:
      "Earn additional rewards by providing liquidity to any of Sifchain's pools.",
  },
  vs: {
    heading: ".39 Validator Subsidy (closed)",
    icon: "interactive/lock" as IconName,
    description:
      "Earn additional rewards by staking a node or delegating to a staked node.",
  },
};

const formatRowanNumber = (n?: number) => {
  if (n == null) return "0";
  return (
    format(Amount(String(n.toFixed(18))), {
      mantissa: 4,
      zeroFormat: "0",
    }) || "0"
  );
};

export const SunsetRewardSection = defineComponent({
  name: "RewardSection",
  props: {
    rewardType: {
      type: String,
      required: true,
    },
    data: {
      type: Object as PropType<CryptoeconomicsUserData>,
      required: true,
    },
    alreadyClaimed: { type: Boolean, required: true },
    infoLink: { type: String, required: true },
    onClaimIntent: { type: Function as PropType<() => void>, required: true },
  },
  setup(props) {
    const displayData = computed(
      () =>
        REWARD_TYPE_DISPLAY_DATA[props.rewardType as CryptoeconomicsRewardType],
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
