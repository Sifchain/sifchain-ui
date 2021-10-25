import AssetIcon from "@/components/AssetIcon";
import ResourcefulTextTransition from "@/components/ResourcefulTextTransition/ResourcefulTextTransition";
import { TokenIcon } from "@/components/TokenIcon";
import { Tooltip } from "@/components/Tooltip";
import { useNativeChain } from "@/hooks/useChains";
import { accountStore } from "@/store/modules/accounts";
import { animateFireflies } from "@/utils/animateFireflies";
import { prettyNumber } from "@/utils/prettyNumber";
import { defineComponent, HTMLAttributes, PropType } from "vue";
import {
  Competition,
  CompetitionType,
  COMPETITION_TYPE_DISPLAY_DATA,
  LeaderboardItem,
} from "../useCompetitionData";
import { LeaderboardAvatar } from "./LeaderboardAvatar";
// animateFireflies();
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
    const props = this;
    const content = (
      <div
        class={[
          "h-[40px] px-[16px] flex items-center text-base rounded-[30px]",
          this.isMyself
            ? "border border-solid border-accent-base"
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
          class="transition-all font-mono"
        >
          {prettyNumber(this.item.rank, 0)}
        </section>

        <section class="w-[350px] flex items-center ml-[16px] whitespace-nowrap">
          <LeaderboardAvatar size={30} name={props.item.name} />
          <div
            onMouseenter={(e) => {
              this.isHovering = true;
            }}
            onMouseleave={(e) => {
              this.isHovering = false;
            }}
            class={[`cursor-pointer ml-[8px] translate-y-[-1px]`]}
          >
            {/* {props.item.name} */}
            <ResourcefulTextTransition
              class="w-[200px] inline-block"
              text={this.displayedText + (this.isMyself ? ` (you)` : "")}
            />
          </div>
        </section>

        <section class="ml-[32px] flex items-center">
          <TokenIcon assetValue={this.competition.rewardAsset} size={19} />
          <div
            class={[
              "ml-[8px] font-mono",
              !props.isMyself && "text-accent-base",
            ]}
          >
            <ResourcefulTextTransition
              class="w-[200px] inline-block"
              text={prettyNumber(props.pendingReward, 0)}
            />
            {/* {prettyNumber(props.item.pendingReward, 0)} */}
          </div>
        </section>

        <section class="flex-1 flex items-center justify-end font-mono">
          {COMPETITION_TYPE_DISPLAY_DATA[props.item.type].renderValue(
            props.item.value,
          )}
        </section>
      </div>
    );

    // if (props.isMyself) {
    //   return (
    //     <Tooltip
    //       followCursor
    //       interactive
    //       delay={100}
    //       content={accountStore.state.sifchain.address}
    //     >
    //       {content}
    //     </Tooltip>
    //   );
    // }

    return content;
  },
});
