import { ButtonHTMLAttributes, SetupContext } from "vue";
import AssetIcon, { IconName } from "@/componentsLegacy/utilities/AssetIcon";

export function _Select(
  props: ButtonHTMLAttributes & {
    active?: boolean;
    chevronIcon?: IconName;
  },
  ctx: SetupContext,
) {
  return (
    <button
      {...props}
      class={[
        "transition-all duration-200 relative flex justify-between items-center w-[186px] h-[54px] pl-[8px] pr-0 rounded-[4px] bg-gray-input border-solid border-gray-input_outline border border-solid border-transparent active:border-white disabled:bg-transparent text-lg font-medium",
        props.active && "border-white",
        props.class,
      ]}
    >
      {ctx.slots.default?.()}
      <AssetIcon
        class={[
          "w-[24px] h-[24px] ml-[8px] mr-[16px] transition-all duration-100",
          props.active && "rotate-180",
        ]}
        size={24}
        icon={props.chevronIcon || "interactive/chevron-down"}
      />
    </button>
  );
}
