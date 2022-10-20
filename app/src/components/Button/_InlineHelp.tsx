import AssetIcon from "~/components/AssetIcon";
import {
  ButtonHTMLAttributes,
  defineComponent,
  mergeProps,
  SetupContext,
} from "vue";
import { Tooltip } from "../Tooltip";

export const _InlineHelp = defineComponent({
  setup(
    props: ButtonHTMLAttributes & {
      size?: number;
      iconClass?: string;
    },
    ctx: SetupContext,
  ) {
    return () => {
      const content = ctx.slots?.default?.();

      const icon = (
        <AssetIcon
          class={["inline flex-shrink-0", props.iconClass]}
          size={props.size || 16}
          icon="interactive/circle-question"
        ></AssetIcon>
      );
      return (
        <button
          {...props}
          class={[
            `text-accent-base ml-[.25em]  inline align-top hover:opacity-80`,
            props.class,
          ]}
          style={
            mergeProps(
              { style: { transform: "translateY(-1px)" } },
              { style: props.style },
            ).style as ButtonHTMLAttributes["style"]
          }
        >
          {!!content ? (
            <Tooltip
              interactive
              inlinePositioning={true}
              placement="top"
              arrow
              appendTo={() => document.body}
              content={<div>{content}</div>}
            >
              {icon}
            </Tooltip>
          ) : (
            icon
          )}
        </button>
      );
    };
  },
});
