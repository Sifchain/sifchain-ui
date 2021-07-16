import AssetIcon from "@/componentsLegacy/utilities/AssetIcon";
import {
  ButtonHTMLAttributes,
  defineComponent,
  mergeProps,
  PropType,
  ref,
  SetupContext,
} from "vue";
import { Tooltip, TooltipInstance } from "../Tooltip";

export const _InlineHelp = defineComponent({
  setup(props, ctx: SetupContext) {
    return () => (
      <button class={[`inline align-top hover:opacity-80 ml-[2px] mt-[-2px]`]}>
        <Tooltip
          interactive
          inlinePositioning={true}
          placement="top"
          arrow
          content={<div>{ctx.slots?.default?.()}</div>}
        >
          <AssetIcon
            class="text-accent-base inline"
            size={"1.285em"}
            icon="interactive/circle-question"
          ></AssetIcon>
        </Tooltip>
      </button>
    );
  },
});
