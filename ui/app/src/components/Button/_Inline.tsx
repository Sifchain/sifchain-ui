import AssetIcon, { IconName } from "@/componentsLegacy/utilities/AssetIcon";
import { ButtonHTMLAttributes, SetupContext } from "vue";
import { RouteLocationRaw, RouterLink } from "vue-router";

export function _Inline(
  props: ButtonHTMLAttributes & {
    to?: RouteLocationRaw;
    icon?: IconName;
  },
  ctx: SetupContext,
) {
  const Cmp = props.to ? RouterLink : "button";
  return (
    <Cmp
      {...props}
      class={[
        "button flex items-center rounded text-xs font-semibold h-[32px] px-[8px] text-accent-base bg-gray-action_button disabled:text-gray-disabled active:bg-accent-gradient active:text-white",
        props.class,
      ]}
    >
      {!!props.icon && (
        <AssetIcon
          icon={props.icon}
          class="w-[20px] h-[20px] mr-[4px]"
          disabled={props.disabled}
        />
      )}
      {ctx.slots.default?.()}
    </Cmp>
  );
}
