import AssetIcon from "@/components/AssetIcon";
import {
  ButtonHTMLAttributes,
  defineComponent,
  mergeProps,
  SetupContext,
} from "vue";
import { Tooltip, TooltipInstance } from "../Tooltip";

export const _InlineHelp = defineComponent({
  setup(
    props: ButtonHTMLAttributes & {
      size?: number;
      iconClass?: string;
    },
    ctx: SetupContext,
  ) {
    return () => (
      <button
        {...props}
        class={[`inline align-top hover:opacity-80 ml-[.25em]`, props.class]}
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
            class={["text-accent-base inline", props.iconClass]}
            size={props.size || 16}
            icon="interactive/circle-question"
          ></AssetIcon>
        </Tooltip>
      </button>
    );
  },
});
