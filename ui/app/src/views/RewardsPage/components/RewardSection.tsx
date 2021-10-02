import AssetIcon, { IconName } from "@/components/AssetIcon";
import { TokenIcon } from "@/components/TokenIcon";
import { Asset, Amount, AppCookies, NetworkEnv, Network } from "@sifchain/sdk";
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
import { flagsStore } from "@/store/modules/flags";
import { RewardProgram } from "../useRewardsPageData";

const REWARD_TYPE_DISPLAY_DATA = {
  harvest: {
    heading: "Sif's Harvest",
    icon: "navigation/harvest" as IconName,
    description:
      "Immediately earn and claim rewards of mythological proportions by providing liquidity to any of Sifchain's token pools.",
  },
  COSMOS_IBC_REWARDS_V1: {
    heading: ".42 Liquidity Mining",
    icon: "navigation/pool" as IconName,
    description:
      "Earn additional rewards by providing liquidity to any of Sifchain's Cosmos IBC token pools.",
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
    rewardProgram: { type: Object as PropType<RewardProgram>, required: true },
    alreadyClaimed: { type: Boolean, required: true },
    onClaimIntent: { type: Function as PropType<() => void>, required: true },
  },
  computed: {
    details(): {
      hide?: boolean;
      name: string;
      tooltip?: string;
      amount?: number;
    }[] {
      return [
        {
          name: "Reserved Comission Rewards",
          tooltip:
            "These are rewards you have earned from your delegators, but are not yet claimable due to either: a) your delegators not claiming their portion of these rewards yet or b) those rewards for your delegators not reaching full maturity yet.  Once one of these actions happen, these rewards will be considered claimable for you.",
          amount: this.rewardProgram.participant
            ?.currentTotalCommissionsOnClaimableDelegatorRewards,
        },
        {
          name: "Pending Dispensation",
          tooltip:
            "This is the amount that will be dispensed on Friday. Any new claimable amounts will need to be claimed after the next dispensation.",
          amount: this.rewardProgram.participant
            ?.claimedCommissionsAndRewardsAwaitingDispensation,
        },
        {
          name: "Dispensed Rewards",
          tooltip: "Rewards that have already been dispensed.",
          amount: this.rewardProgram.participant?.dispensed,
        },
      ];
    },
    displayData(): typeof REWARD_TYPE_DISPLAY_DATA[keyof typeof REWARD_TYPE_DISPLAY_DATA] {
      return REWARD_TYPE_DISPLAY_DATA[
        this.rewardProgram
          .rewardProgramName as keyof typeof REWARD_TYPE_DISPLAY_DATA
      ];
    },
  },
  setup() {
    return {
      core: useCore(),
    };
  },
  render() {
    const { store } = useCore();

    const sifConnected = accountStore.refs.sifchain.connected.computed();

    return (
      <>
        <div class="mt-[10px] text-lg flex">
          <div class="text-left w-[250px] flex items-center">
            <AssetIcon
              icon={this.displayData.icon}
              size={20}
              class="mr-[10px]"
            />
            {this.displayData.heading}
          </div>

          <div class="text-right justify-end flex-1 font-mono flex items-center">
            {/* Full Amount */}
            {this.rewardProgram.distributionPattern === "GEYSER" ? (
              <>
                {" "}
                {formatRowanNumber(
                  this.rewardProgram.participant
                    ?.totalCommissionsAndRewardsAtMaturity,
                )}{" "}
                <TokenIcon
                  assetValue={Asset.get("rowan")}
                  size={20}
                  class="ml-[10px]"
                />
              </>
            ) : (
              <>{this.rewardProgram.summaryAPY.toFixed(4)} %</>
            )}
          </div>
          <div class="w-[300px] text-right justify-end font-mono flex items-center">
            {/* Claimable Amount */}
            {formatRowanNumber(
              this.rewardProgram?.participant
                ?.totalClaimableCommissionsAndClaimableRewards,
            )}
            <TokenIcon
              assetValue={Asset.get("rowan")}
              size={20}
              class="ml-[10px]"
            />
          </div>
        </div>
        <div class="mt-[10px] flex justify-between text-[16px] bg-gray-base py-2 px-3">
          <div class="flex flex-col justify-between">
            <div class="opacity-50 mb-[20px]">
              {this.displayData.description}
              <br />
              <div
                style={{
                  fontVariantCaps: "small-caps",
                }}
              >
                {!this.rewardProgram.isUniversal &&
                  this.rewardProgram.incentivizedPoolSymbols
                    .map((poolSymbol) => {
                      return poolSymbol;
                    })
                    .join(", ")}
              </div>
            </div>
            <div></div>
            {/* Claimable Amount */}

            {this.details.map((detail, index) => (
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
                href={this.rewardProgram.documentationURL}
                target="_blank"
                disabled={!sifConnected.value}
                rel="noopener noreferrer"
              >
                Learn More
              </Button.Inline>{" "}
              {/* <Button.Inline
                onClick={() => {
                  if (
                    window.location.hostname !== "dex.sifchain.finance" &&
                    AppCookies().getEnv() === NetworkEnv.MAINNET &&
                    !window.confirm(
                      "Are you sure you want to claim rewards on your mainnet account? It seems like you're testing this feature. If so, please be sure to do this on a dedicated betanet test wallet. Press 'cancel' to exit or 'ok' to continue",
                    )
                  ) {
                    alert("claim canceled.");
                    return;
                  }
                  props.onClaimIntent();
                }}
                class="w-full mt-[6px]"
                icon="navigation/rewards"
                active
                disabled={
                  !flagsStore.state.rewardClaims ||
                  props.alreadyClaimed ||
                  !props.data?.user
                    ?.totalClaimableCommissionsAndClaimableRewards
                }
              >
                {props.alreadyClaimed ? "Pending Claim" : "Claim Reward"}
              </Button.Inline> */}
            </div>
          </div>
        </div>
      </>
    );
  },
});
