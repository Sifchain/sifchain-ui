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
  },
  setup(props) {
    return () =>
      !props.asset.value ? null : (
        <Tooltip
          content={
            <>
              You're adding liquidity to
              <span class="text-accent-base mx-1 font-medium">
                {props.asset.value.displaySymbol.toUpperCase()}'s
              </span>{" "}
              pool.
            </>
          }
        >
          <div class="flex items-center gap-1 font-semibold">
            {props.hideTokenSymbol || props.invert
              ? null
              : props.asset.value.displaySymbol.toUpperCase()}{" "}
            <span class="z-10">
              <TokenIcon asset={ref(Asset("rowan"))} size={26} />
            </span>
            <span class="-translate-x-2 overflow-hidden rounded-full bg-black ring ring-black">
              <TokenIcon asset={props.asset} size={26} />
            </span>
            {props.hideTokenSymbol || !props.invert
              ? null
              : props.asset.value.displaySymbol.toUpperCase()}{" "}
          </div>
        </Tooltip>
      );
  },
});
