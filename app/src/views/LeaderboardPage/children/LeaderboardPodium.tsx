import { defineComponent, HTMLAttributes, PropType } from "vue";

import ResourcefulTextTransition from "~/components/ResourcefulTextTransition/ResourcefulTextTransition";
import { TokenIcon } from "~/components/TokenIcon";
import { prettyNumber } from "~/utils/prettyNumber";
import {
  Competition,
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
      <div class="relative flex w-1/3 flex-col items-center">
        <section class="flex h-[160px] flex-col items-center justify-end">
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
                class="translate-y-[-50%] rounded-[20px] p-[2px]"
              >
                <div class="bg-accent-muted color-accent-light flex h-[18px] items-center rounded-[20px] p-[10px] text-sm">
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
                  ? "mt-[-110px] h-[152px] w-[185px]"
                  : "mt-[7px] h-[21px] w-[98px]",
              ]}
            />
          </div>
        </section>

        <div
          class={[
            "text-accent-base mt-[10px] h-[42px] w-full cursor-pointer whitespace-nowrap text-center",
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
        <div class="mt-[4px] font-mono text-sm">
          {COMPETITION_TYPE_DISPLAY_DATA[this.competition.type].renderValue(
            this.item.value,
          )}
        </div>
        <div class="bg-gray-ring text-accent-base mt-[4px] flex h-[28px] items-center rounded-[20px] px-[10px] font-mono">
          <TokenIcon size={20} assetValue={this.competition.rewardAsset} />
          <div class="ml-[4px] translate-y-[-1px]">
            {prettyNumber(this.pendingReward, 0)}
          </div>
        </div>
      </div>
    );
  },
});
