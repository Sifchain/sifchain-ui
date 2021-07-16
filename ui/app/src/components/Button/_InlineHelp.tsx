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
  setup(props: ButtonHTMLAttributes, ctx: SetupContext) {
    return () => (
      <button
        {...props}
        class={[`inline align-top hover:opacity-80 ml-[2px]`, props.class]}
        style={
          mergeProps(
            { style: { transform: "translateY(-1px)" } },
            { style: props.style },
          ).style as ButtonHTMLAttributes["style"]
        }
      >
        <Tooltip
          interactive
          inlinePositioning={true}
          placement="top"
          arrow
          appendTo={() => document.body}
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
