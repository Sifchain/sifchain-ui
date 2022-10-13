import { ButtonHTMLAttributes, SetupContext } from "vue";
import AssetIcon, { IconName } from "~/components/AssetIcon";

export function _Select(
  props: ButtonHTMLAttributes & {
    active?: boolean;
    chevronIcon?: IconName;
    hideIcon?: boolean;
  },
  ctx: SetupContext,
) {
  return (
    <button
      {...props}
      class={[
        "bg-gray-input border-gray-input_outline border-gray-input_outline relative flex h-[54px] items-center justify-between whitespace-nowrap rounded-[4px] border border-solid border-solid pl-[8px] pr-0 text-lg font-medium transition-all duration-200 active:border-white disabled:bg-transparent",
        props.active && "border-white",
        props.class,
      ]}
    >
      {ctx.slots.default?.()}
      {!props.hideIcon && (
        <AssetIcon
          class={[
            "ml-[8px] mr-[16px] h-[24px] w-[24px] flex-shrink-0 transition-all duration-100",
            props.active && "rotate-180",
          ]}
          size={24}
          icon={props.chevronIcon || "interactive/chevron-down"}
        />
      )}
    </button>
  );
}
