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

export const LeaderboardRow = defineComponent({
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
    maximumRank: {
      type: Number as PropType<number>,
      required: true,
    },
    class: String as PropType<HTMLAttributes["class"]>,
    isMyself: Boolean,
    style: Object,
  },
  data: (_) => ({
    isHovering: false,
  }),
  computed: {
    displayedText() {
      const name: string = this.item.name;
      const addr: string = this.item.address;
      if (this.isHovering) {
        return addr;
      }
      return name.toLocaleLowerCase();
    },
  },
  render: function LeaderboardRow() {
    const content = (
      <div
        class={[
          "flex h-[40px] items-center rounded-[30px] px-[16px] text-base",
          this.isMyself
            ? "border-accent-base border border-solid"
            : "bg-gray-100",
          this.class,
        ]}
        {...this.$attrs}
        style={{
          ...(this.isMyself && {
            backgroundImage:
              "linear-gradient(180deg, #C1A04F 0%, #A48524 100%)",
          }),
          ...this.style,
        }}
      >
        <section
          style={{
            // Width of the maximumRank's char width (if self is rank 5000, ensure all placements are offset to fit 5000)
            width: prettyNumber(this.maximumRank, 0).length + "ch",
          }}
          class="font-mono transition-all"
        >
          {prettyNumber(this.item.rank, 0)}
        </section>

        <section class="ml-[16px] flex w-[350px] items-center whitespace-nowrap">
          <LeaderboardAvatar size={30} name={this.item.name} />
          <div
            onMouseenter={(e) => {
              this.isHovering = true;
            }}
            onMouseleave={(e) => {
              this.isHovering = false;
            }}
            class={[`ml-[8px] translate-y-[-1px] cursor-pointer`]}
          >
            {/* {props.item.name} */}
            <ResourcefulTextTransition
              class="inline-block w-[200px]"
              text={this.displayedText + (this.isMyself ? ` (you)` : "")}
            />
          </div>
        </section>

        <section class="ml-[32px] flex items-center">
          <TokenIcon assetValue={this.competition.rewardAsset} size={19} />
          <div
            class={["ml-[8px] font-mono", !this.isMyself && "text-accent-base"]}
          >
            <ResourcefulTextTransition
              class="inline-block w-[200px]"
              text={prettyNumber(this.pendingReward, 0)}
            />
            {/* {prettyNumber(props.item.pendingReward, 0)} */}
          </div>
        </section>

        <section class="flex flex-1 items-center justify-end font-mono">
          {COMPETITION_TYPE_DISPLAY_DATA[this.item.type].renderValue(
            this.item.value,
          )}
        </section>
      </div>
    );

    return content;
  },
});
