import AssetIcon, { IconName } from "~/components/AssetIcon";
import { AnchorHTMLAttributes, ButtonHTMLAttributes, SetupContext } from "vue";
import { RouteLocationRaw, RouterLink } from "vue-router";

export function _Inline(
  props: ButtonHTMLAttributes &
    AnchorHTMLAttributes & {
      active?: boolean;
      to?: RouteLocationRaw;
      replace?: boolean;
      icon?: IconName;
      iconClass?: string;
    },
  ctx: SetupContext,
) {
  const Cmp = props.to ? RouterLink : props.href ? "a" : "button";
  const content = ctx.slots.default?.();
  return (
    <Cmp
      {...props}
      class={[
        "button text-accent-base bg-gray-action_button active:bg-accent-gradient flex h-[32px] items-center rounded px-[8px] text-sm font-semibold active:text-white",
        props.class,
        props.disabled &&
          "!text-gray-disabled pointer-events-none !bg-transparent",
        props.active && !props.disabled && "bg-accent-gradient !text-white",
      ]}
    >
      {!!props.icon && (
        <AssetIcon
          icon={props.icon}
          class={[
            "h-[20px] w-[20px]",
            !!content && "mr-[4px]",
            props.iconClass,
          ]}
          disabled={Boolean(props.disabled)}
        />
      )}
      {content}
    </Cmp>
  );
}
