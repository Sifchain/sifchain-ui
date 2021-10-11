import AssetIcon, { IconName } from "@/components/AssetIcon";
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
        "button flex items-center rounded text-sm font-semibold h-[32px] px-[8px] text-accent-base bg-gray-action_button active:bg-accent-gradient active:text-white",
        props.class,
        props.disabled &&
          "pointer-events-none !text-gray-disabled !bg-transparent",
        props.active && !props.disabled && "bg-accent-gradient text-white",
      ]}
    >
      {!!props.icon && (
        <AssetIcon
          icon={props.icon}
          class={[
            "w-[20px] h-[20px]",
            !!content && "mr-[4px]",
            props.iconClass,
          ]}
          disabled={props.disabled}
        />
      )}
      {content}
    </Cmp>
  );
}
