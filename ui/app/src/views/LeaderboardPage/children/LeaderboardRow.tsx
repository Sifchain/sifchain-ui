import AssetIcon from "@/components/AssetIcon";
import { TokenIcon } from "@/components/TokenIcon";
import { useNativeChain } from "@/hooks/useChains";
import { prettyNumber } from "@/utils/prettyNumber";
import { defineComponent, HTMLAttributes, PropType } from "vue";
import {
  LeaderboardCompetitionType,
  LeaderboardItem,
} from "../useLeaderboardData";
import { LeaderboardAvatar } from "./LeaderboardAvatar";

export function LeaderboardRow(props: {
  item: LeaderboardItem;
  maximumRank: number;
  class: HTMLAttributes["class"];
  isMyself: Boolean;
  type: LeaderboardCompetitionType;
  style?: object;
}) {
  const { class: cls, item, ...rest } = props;

  return (
    <div
      class={[
        "h-[40px] px-[16px] flex items-center text-base rounded-[30px]",
        props.isMyself
          ? "border border-solid border-accent-base"
          : "bg-gray-100",
        props.class,
      ]}
      {...rest}
      style={{
        ...(props.isMyself && {
          backgroundImage: "linear-gradient(180deg, #C1A04F 0%, #A48524 100%)",
        }),
        ...rest.style,
      }}
    >
      <section
        style={{
          // Width of the maximumRank's char width (if self is rank 5000, ensure all placements are offset to fit 5000)
          width: prettyNumber(props.maximumRank, 0).length + "ch",
        }}
        class="transition-all font-mono"
      >
        {prettyNumber(props.item.rank, 0)}
      </section>

      <section class="w-[350px] flex items-center ml-[16px] whitespace-nowrap">
        <LeaderboardAvatar size={30} name={props.item.name} />
        <div class="ml-[8px] translate-y-[-1px]">
          {props.item.name}
          {props.isMyself && ` (you)`}
        </div>
      </section>

      <section class="ml-[32px] flex items-center">
        <TokenIcon assetValue={useNativeChain().nativeAsset} size={19} />
        <div
          class={["ml-[8px] font-mono", !props.isMyself && "text-accent-base"]}
        >
          {prettyNumber(props.item.pendingReward, 0)}
        </div>
      </section>

      <section class="flex-1 flex items-center justify-end font-mono">
        {props.type === "vol" ? "Volume $" : "Tx "}
        {prettyNumber(props.item.value, 0)}
      </section>
    </div>
  );
}
