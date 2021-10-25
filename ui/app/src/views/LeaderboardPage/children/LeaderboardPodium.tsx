import ResourcefulTextTransition from "@/components/ResourcefulTextTransition/ResourcefulTextTransition";
import { TokenIcon } from "@/components/TokenIcon";
import { useNativeChain } from "@/hooks/useChains";
import { prettyNumber } from "@/utils/prettyNumber";
import { defineComponent, HTMLAttributes, PropType } from "vue";
import {
  Competition,
  CompetitionType,
  COMPETITION_TYPE_DISPLAY_DATA,
  LeaderboardItem,
} from "../useCompetitionData";
import { LeaderboardAvatar } from "./LeaderboardAvatar";

export const LeaderboardPodium = defineComponent({
  name: "LeaderboardPoidum",
  props: {
    item: {
      type: Object as PropType<LeaderboardItem>,
      required: true,
    },
    pendingReward: {
      type: Number as PropType<number>,
      required: true,
    },
    competition: {
      type: Object as PropType<Competition>,
      required: true,
    },
    class: {
      type: String as PropType<HTMLAttributes["class"]>,
    },
  },
  data: (_) => ({
    isHovering: false,
  }),
  computed: {
    nameLines(): string[] {
      const [l1, l2] = this.item.name.split(/,\s+/);
      return [`${l1},`, l2].map((s) => s.toLocaleLowerCase());
    },
    displayLines(): string[] {
      if (this.isHovering) {
        return [this.item.address, " "];
      }
      return this.nameLines;
    },
    isFirst(): boolean {
      return this.item.rank === 1;
    },
    placementText(): string {
      if (this.item.rank === 1) return "1st";
      if (this.item.rank === 2) return "2nd";
      return "3rd";
    },
    wreathSrc(): string {
      return this.isFirst ? "/images/wreath.svg" : "/images/wreath-small.svg";
    },
  },
  render() {
    return (
      <div class="flex flex-col items-center relative w-1/3">
        <section class="h-[160px] flex flex-col items-center justify-end">
          <div class="relative flex flex-col items-center">
            <LeaderboardAvatar
              name={this.item.name}
              size={this.isFirst ? 115 : 76}
              style={{
                boxShadow: "0px 40px 60px #2ad9ff",
              }}
            />
            <div
              class={[
                "absolute flex items-center justify-center",
                this.isFirst ? "top-[115px]" : "top-[76px]",
              ]}
            >
              <div
                style={{
                  background:
                    "linear-gradient(180deg, #FFDC6F 0%, #89691A 100%)",
                }}
                class="p-[2px] rounded-[20px] translate-y-[-50%]"
              >
                <div class="bg-accent-muted h-[18px] p-[10px] flex items-center text-sm color-accent-light rounded-[20px]">
                  {this.placementText}
                </div>
              </div>
            </div>
            <div
              style={{
                backgroundImage: `url(${
                  this.isFirst
                    ? "/images/wreath.svg"
                    : "/images/wreath-small.svg"
                })`,
                backgroundSize: "contain",
              }}
              class={[
                this.isFirst
                  ? "w-[185px] h-[152px] mt-[-110px]"
                  : "w-[98px] h-[21px] mt-[7px]",
              ]}
            />
          </div>
        </section>

        <div
          class={[
            "mt-[10px] text-accent-base text-center whitespace-nowrap cursor-pointer h-[42px] w-full",
          ]}
          onMouseenter={(e) => {
            this.isHovering = true;
          }}
          onMouseleave={(e) => {
            this.isHovering = false;
          }}
        >
          <ResourcefulTextTransition text={this.displayLines[0]} />
          <ResourcefulTextTransition text={this.displayLines[1]} />
        </div>
        <div class="mt-[4px] text-sm font-mono">
          {COMPETITION_TYPE_DISPLAY_DATA[this.competition.type].renderValue(
            this.item.value,
          )}
        </div>
        <div class="mt-[4px] bg-gray-ring h-[28px] px-[10px] flex items-center text-accent-base font-mono rounded-[20px]">
          <TokenIcon size={20} assetValue={this.competition.rewardAsset} />
          <div class="ml-[4px] translate-y-[-1px]">
            {prettyNumber(this.pendingReward, 0)}
          </div>
        </div>
      </div>
    );
  },
});
