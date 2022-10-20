import AssetIcon, { IconName } from "~/components/AssetIcon";
import { TokenIcon } from "~/components/TokenIcon";
import { Asset, IAsset } from "@sifchain/sdk";
import { Button } from "~/components/Button/Button";
import { defineComponent, PropType } from "vue";
import { useCore } from "~/hooks/useCore";
import { accountStore } from "~/store/modules/accounts";
import { rewardColumnsLookup, RewardProgram } from "../useRewardsPageData";
import { getClaimableAmountString } from "../getClaimableAmountString";
import { symbolWithoutPrefix } from "~/utils/symbol";
import { useNativeChain } from "~/hooks/useChains";

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
  expansion_v4_bonus: {
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
      return new Date() > new Date(this.rewardProgram.startDateTimeISO ?? "");
    },
    programEnded(): boolean {
      return new Date() > new Date(this.rewardProgram.endDateTimeISO ?? "");
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
          name: "Pending Rewards",
          tooltip:
            "This is the amount that will be dispensed on Tuesday. Any new claimable amounts will need to be claimed after the next dispensation.",
          amount: this.rewardProgram.participant?.pendingRewards,
        },
        {
          name: "Dispensed Rewards",
          tooltip: "Rewards that have already been dispensed.",
          amount: this.rewardProgram.participant?.dispensed,
        },
      ];
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
    const sifConnected = this.sifConnected;

    return (
      <article class="border-b border-solid border-gray-200 border-opacity-80 py-[16px] align-middle last:border-transparent hover:opacity-80">
        <section
          class="text flex cursor-pointer items-center"
          onClick={() => (this.expanded = !this.expanded)}
          style={{
            opacity: this.rewardProgram.endDateTimeISO
              ? new Date(this.rewardProgram.endDateTimeISO).getTime() <
                Date.now()
                ? 0.5
                : 1
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
              "flex items-center justify-end font-mono",
            ]}
          >
            {/* Full Amount */}
            {["expansion_bonus", "expansion_v2_bonus"].includes(
              this.rewardProgram.rewardProgramName,
            )
              ? "+ "
              : ""}
            {this.rewardProgram.summaryAPY.toFixed(4)} %
          </div>
          <div
            class={[
              rewardColumnsLookup.claimableAmount.class,
              "flex items-center justify-end font-mono",
            ]}
          >
            {/* Claimable Amount */}
            {getClaimableAmountString(
              this.rewardProgram?.participant?.accumulatedRewards,
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
          <section class="bg-gray-base mt-[10px] flex justify-between py-2 px-3 text-sm">
            <div class="flex flex-col justify-between">
              <div class="mb-[20px] text-[14px] opacity-50">
                <div>{this.rewardProgram.description}</div>
                <div class={[`w-full`, `flex flex-row`]}>
                  {!this.rewardProgram.isUniversal &&
                    this.rewardProgram.incentivizedPoolSymbols.map(
                      (poolSymbol) => {
                        return (
                          <div class={`p-[4px] pt-[16px] `}>
                            <TokenIcon
                              assetValue={
                                this.poolAssets[poolSymbol] ??
                                this.poolAssets[poolSymbol.slice(1)]
                              }
                            />
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
                  class="mt-[6px] flex w-[400px] justify-between first:mt-0"
                >
                  <span class="flex items-center whitespace-nowrap">
                    {detail.name}
                    {!!detail.tooltip && (
                      <Button.InlineHelp>{detail.tooltip}</Button.InlineHelp>
                    )}
                  </span>
                  <span class="w-[250px] text-right">
                    {detail.amount != null
                      ? getClaimableAmountString(detail.amount)
                      : // TODO: what's this value supposed to be? it doesn't exist in the type definition
                        // @ts-ignore
                        detail.value}
                  </span>
                </div>
              ))}
            </div>

            <div class="flex items-center justify-center">
              <div class="w-[140px] rounded-lg bg-black p-[6px]">
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
              </div>
            </div>
          </section>
        )}
      </article>
    );
  },
});
