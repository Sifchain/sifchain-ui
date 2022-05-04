import { defineComponent, PropType, ComputedRef, ref, Ref } from "vue";
import { Asset, IAsset } from "@sifchain/sdk";

import { TokenIcon } from "@/components/TokenIcon";
import { Tooltip } from "@/components/Tooltip";

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
  },
  setup(props) {
    return () => {
      if (!props.asset.value) {
        return null;
      }

      const inner = (
        <div class="flex items-center gap-1 font-semibold">
          {props.hideTokenSymbol || props.invert
            ? null
            : props.asset.value.displaySymbol.toUpperCase()}{" "}
          <span class="z-10 grid h-[28px] w-[28px] place-items-center overflow-hidden rounded-full bg-black ring ring-black/80">
            <TokenIcon asset={props.asset} size={28} />
          </span>
          <span class="-translate-x-4">
            <TokenIcon asset={ref(Asset("rowan"))} size={26} />
          </span>
          {props.hideTokenSymbol || !props.invert
            ? null
            : props.asset.value.displaySymbol.toUpperCase()}{" "}
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
