import AssetIcon, { IconName } from "@/components/AssetIcon";
import { TokenIcon } from "@/components/TokenIcon";
import { Asset, IAsset } from "@sifchain/sdk";
import { Button } from "@/components/Button/Button";
import { defineComponent, PropType } from "vue";
import { useCore } from "@/hooks/useCore";
import { accountStore } from "@/store/modules/accounts";
import { rewardColumnsLookup, RewardProgram } from "../useRewardsPageData";
import { getClaimableAmountString } from "../getClaimableAmountString";
import { symbolWithoutPrefix } from "@/utils/symbol";
import { useNativeChain } from "@/hooks/useChains";

const REWARD_TYPE_DISPLAY_DATA: Record<string, { icon: IconName }> = {
  harvest: {
    icon: "navigation/harvest",
  },
  default: {
    icon: "navigation/pool",
  },
  harvest_expansion: {
    icon: "navigation/globe",
  },
  expansion_bonus: {
    icon: "navigation/people",
  },
  expansion_v2_bonus: {
    icon: "navigation/people",
  },
};

export const getRewardProgramDisplayData = (rewardProgramName: string) => {
  return (
    REWARD_TYPE_DISPLAY_DATA[
      rewardProgramName as keyof typeof REWARD_TYPE_DISPLAY_DATA
    ] || REWARD_TYPE_DISPLAY_DATA["default"]
  );
};

export const RewardSection = defineComponent({
  name: "RewardSection",
  props: {
    rewardProgram: { type: Object as PropType<RewardProgram>, required: true },
    alreadyClaimed: { type: Boolean, required: true },
    onClaimIntent: { type: Function as PropType<() => void>, required: true },
  },
  data() {
    return {
      expanded: false,
    };
  },
  computed: {
    programStarted(): boolean {
      return new Date() > new Date(this.rewardProgram.startDateTimeISO);
    },
    programEnded(): boolean {
      return new Date() > new Date(this.rewardProgram.endDateTimeISO);
    },
    programActive(): boolean {
      return this.programStarted && !this.programEnded;
    },
    poolAssets() {
      return useNativeChain().assets.reduce((prev, asset) => {
        prev[symbolWithoutPrefix(asset.symbol).toLowerCase()] = asset;
        return prev;
      }, {} as Record<string, IAsset>);
    },
    details(): {
      hide?: boolean;
      name: string;
      tooltip?: string;
      amount?: number;
    }[] {
      return [
        {
          hide: this.rewardProgram.rewardProgramType !== "vs",
          name: "Reserved Commission Rewards",
          tooltip:
            "These are rewards you have earned from your delegators, but are not yet claimable due to either: a) your delegators not claiming their portion of these rewards yet or b) those rewards for your delegators not reaching full maturity yet.  Once one of these actions happen, these rewards will be considered claimable for you.",
          amount:
            this.rewardProgram.participant
              ?.currentTotalCommissionsOnClaimableDelegatorRewards,
        },
        {
          name: "Pending Dispensation",
          tooltip:
            "This is the amount that will be dispensed on Tuesday. Any new claimable amounts will need to be claimed after the next dispensation.",
          amount:
            this.rewardProgram.participant
              ?.claimedCommissionsAndRewardsAwaitingDispensation,
        },
        {
          name: "Dispensed Rewards",
          tooltip: "Rewards that have already been dispensed.",
          amount: this.rewardProgram.participant?.dispensed,
        },
        // {
        //   name: "Program Start",
        //   value: `${new Date(
        //     this.rewardProgram.startDateTimeISO,
        //   ).toLocaleDateString()}, ${new Date(
        //     this.rewardProgram.startDateTimeISO,
        //   ).toLocaleTimeString("en-US", {
        //     hour12: true,
        //     timeZoneName: "short",
        //   })}`,
        // },
        // {
        //   name: "Program End",
        //   value: `${new Date(
        //     this.rewardProgram.endDateTimeISO,
        //   ).toLocaleDateString()}, ${new Date(
        //     this.rewardProgram.endDateTimeISO,
        //   ).toLocaleTimeString("en-US", {
        //     hour12: true,
        //     timeZoneName: "short",
        //   })}`,
        // },
      ].filter((item) => !item.hide);
    },
    displayData(): typeof REWARD_TYPE_DISPLAY_DATA[keyof typeof REWARD_TYPE_DISPLAY_DATA] {
      return getRewardProgramDisplayData(this.rewardProgram.rewardProgramName);
    },
  },
  setup() {
    const sifConnected = accountStore.refs.sifchain.connected.computed();
    return {
      sifConnected,
      core: useCore(),
    };
  },
  render() {
    const { store } = useCore();
    const sifConnected = this.sifConnected;

    const isEarning =
      !this.rewardProgram?.participant
        ?.totalClaimableCommissionsAndClaimableRewards &&
      this.rewardProgram?.participant?.totalCommissionsAndRewardsAtMaturity;
    return (
      <article class="align-middle border-solid border-gray-200 border-b border-opacity-80 last:border-transparent hover:opacity-80 py-[16px]">
        <section
          class="text flex items-center cursor-pointer"
          onClick={() => (this.expanded = !this.expanded)}
          style={{
            opacity:
              new Date(this.rewardProgram.endDateTimeISO).getTime() < Date.now()
                ? 0.5
                : 1,
          }}
        >
          <div
            class={[
              rewardColumnsLookup.rewardProgram.class,
              "flex items-center",
            ]}
          >
            <AssetIcon
              icon={this.displayData.icon}
              size={20}
              class="mr-[10px] flex-shrink-0"
            />
            {this.rewardProgram.displayName}
          </div>
          <div class={[rewardColumnsLookup.duration.class]}>
            {/* Indefinite */}
            {/* {this.programActive
              ? "Until"
              : this.programEnded
              ? "Ended"
              : "Starts"}{" "}
            {new Date(
              !this.programStarted
                ? this.rewardProgram.startDateTimeISO // if not started yet, show start date
                : this.rewardProgram.endDateTimeISO, // If active or ended already, show end date
            ).toLocaleDateString()} */}
          </div>

          <div
            class={[
              rewardColumnsLookup.apy.class,
              "font-mono flex items-center justify-end",
            ]}
          >
            {/* Full Amount */}
            {this.rewardProgram.distributionPattern === "GEYSER" ? null : (
              <>
                {["expansion_bonus", "expansion_v2_bonus"].includes(
                  this.rewardProgram.rewardProgramName,
                )
                  ? "+ "
                  : ""}
                {this.rewardProgram.summaryAPY.toFixed(4)} %
              </>
            )}
          </div>
          <div
            class={[
              rewardColumnsLookup.claimableAmount.class,
              "justify-end font-mono flex items-center",
            ]}
          >
            {/* Claimable Amount */}
            {isEarning
              ? "Earning..."
              : getClaimableAmountString(
                  this.rewardProgram?.participant
                    ?.totalClaimableCommissionsAndClaimableRewards,
                )}
            <TokenIcon
              assetValue={Asset.get("rowan")}
              size={20}
              class="ml-[10px]"
            />
          </div>

          <div class={[rewardColumnsLookup.expand.class]}>
            <button>
              <AssetIcon
                size={24}
                class={[
                  "transition-all",
                  this.expanded ? "rotate-180" : "rotate-0",
                ]}
                icon="interactive/chevron-down"
              ></AssetIcon>
            </button>
          </div>
        </section>
        {this.expanded && (
          <section class="mt-[10px] flex justify-between text-sm bg-gray-base py-2 px-3">
            <div class="flex flex-col justify-between">
              <div class="opacity-50 text-[14px] mb-[20px]">
                <div>{this.rewardProgram.description}</div>
                <div class={[`w-full`, `flex flex-row`]}>
                  {!this.rewardProgram.isUniversal &&
                    this.rewardProgram.incentivizedPoolSymbols.map(
                      (poolSymbol) => {
                        return (
                          <div class={`p-[4px] pt-[16px] `}>
                            <TokenIcon
                              assetValue={this.poolAssets[poolSymbol]}
                            ></TokenIcon>
                          </div>
                        );
                      },
                    )}
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
                    {detail.amount != null
                      ? getClaimableAmountString(detail.amount)
                      : // TODO: what's this value supposed to be? it doesn't exist in the type definition
                        detail.value}
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
                  disabled={!sifConnected}
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
          </section>
        )}
      </article>
    );
  },
});
