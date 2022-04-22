import { defineComponent, PropType, ComputedRef, ref } from "vue";
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
    asset: {
      type: Object as PropType<ComputedRef<IAsset | undefined>>,
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
          <div class="flex items-center font-semibold">
            {props.hideTokenSymbol
              ? null
              : props.asset.value.displaySymbol.toUpperCase()}{" "}
            <span class="translate-x-1">
              <TokenIcon asset={ref(Asset("rowan"))} size={26} />
            </span>
            <span class="z-10 overflow-hidden rounded-full bg-black ring ring-black">
              <TokenIcon asset={props.asset} size={26} />
            </span>
          </div>
        </Tooltip>
      );
  },
});
