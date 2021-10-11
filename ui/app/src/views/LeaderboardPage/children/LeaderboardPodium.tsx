import { TokenIcon } from "@/components/TokenIcon";
import { useNativeChain } from "@/hooks/useChains";
import { prettyNumber } from "@/utils/prettyNumber";
import { defineComponent, HTMLAttributes, PropType } from "vue";
import {
  LeaderboardCompetitionType,
  LeaderboardItem,
} from "../useLeaderboardData";
import { LeaderboardAvatar } from "./LeaderboardAvatar";

export const LeaderboardPodium = defineComponent({
  name: "LeaderboardPoidum",
  props: {
    item: {
      type: Object as PropType<LeaderboardItem>,
      required: true,
    },
    type: {
      type: String as PropType<LeaderboardCompetitionType>,
      required: true,
    },
    class: {
      type: String as PropType<HTMLAttributes["class"]>,
    },
  },
  computed: {
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

        <div class="mt-[10px] text-accent-base text-center">
          {this.item.name.split(", ")[0]},
          <div class="capitalize">{this.item.name.split(", ")[1]}</div>
        </div>
        <div class="mt-[4px] text-sm font-mono">
          {this.type === "vol" ? "Volume $" : "Tx "}
          {prettyNumber(this.item.value, 0)}
        </div>
        <div class="mt-[4px] bg-gray-ring h-[28px] px-[10px] flex items-center text-accent-base font-mono rounded-[20px]">
          <TokenIcon size={20} assetValue={useNativeChain().nativeAsset} />
          <div class="ml-[4px] translate-y-[-1px]">
            {prettyNumber(this.item.pendingReward, 0)}
          </div>
        </div>
      </div>
    );
  },
});
