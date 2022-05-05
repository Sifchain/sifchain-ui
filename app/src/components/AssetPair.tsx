import { defineComponent, PropType, ComputedRef, ref, Ref } from "vue";
import { Asset, IAsset } from "@sifchain/sdk";

import { TokenIcon } from "@/components/TokenIcon";
import { Tooltip } from "@/components/Tooltip";
import clsx from "clsx";

export default defineComponent({
  name: "AssetPair",
  props: {
    hideTokenSymbol: {
      type: Boolean as PropType<boolean>,
      default: false,
    },
    invert: {
      type: Boolean as PropType<boolean>,
      default: false,
    },
    asset: {
      type: Object as PropType<
        ComputedRef<IAsset | undefined> | Ref<IAsset | undefined>
      >,
      required: true,
    },
    tooltipContent: {
      type: Object as PropType<JSX.Element | string>,
      required: false,
    },
    size: {
      type: String as PropType<"xs" | "sm" | "md" | "lg" | "xl" | "2xl">,
      default: "md",
    },
  },
  setup(props) {
    const sizeVariants = {
      xs: { class: "h-[20px] w-[20px]", size: 20 },
      sm: { class: "h-[22.5px] w-[22.5px]", size: 22.5 },
      md: { class: "h-[24px] w-[24px]", size: 24 },
      lg: { class: "h-[28px] w-[28px]", size: 28 },
      xl: { class: "h-[34px] w-[34px]", size: 34 },
      "2xl": { class: "h-[42px] w-[42px]", size: 42 },
    };

    return () => {
      if (!props.asset.value) {
        return null;
      }
      const label = (
        <span class="text-gray-sif200 text-base">
          {props.asset.value.displaySymbol.toUpperCase()}
        </span>
      );

      const sizeVariant = sizeVariants[props.size];

      const inner = (
        <div class="text-gray-sif200 flex items-center gap-1 font-semibold">
          {props.hideTokenSymbol || props.invert ? null : label}{" "}
          <span
            class={clsx(
              "z-10 grid place-items-center overflow-hidden rounded-full bg-black ring ring-black/80",
              sizeVariant.class,
            )}
          >
            <TokenIcon asset={props.asset} size={sizeVariant.size} />
          </span>
          <span class="-ml-3">
            <TokenIcon
              asset={ref(Asset("rowan"))}
              size={sizeVariant.size - 2}
            />
          </span>
          {props.hideTokenSymbol || !props.invert ? null : label}{" "}
        </div>
      );

      return props.tooltipContent ? (
        <Tooltip content={props.tooltipContent}>{inner}</Tooltip>
      ) : (
        inner
      );
    };
  },
});
