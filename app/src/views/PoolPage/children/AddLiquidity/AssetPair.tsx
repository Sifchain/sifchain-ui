import { defineComponent, PropType, ComputedRef, ref } from "vue";
import { Asset, IAsset } from "@sifchain/sdk";

import { TokenIcon } from "@/components/TokenIcon";

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
        <div class="flex items-center font-semibold">
          {props.hideTokenSymbol
            ? null
            : props.asset.value.displaySymbol.toUpperCase()}{" "}
          <span class="z-10 translate-x-1">
            <TokenIcon asset={props.asset} size={32} />
          </span>
          <span class="overflow-hidden rounded-full bg-black ring ring-black">
            <TokenIcon asset={ref(Asset("rowan"))} size={30} />
          </span>
        </div>
      );
  },
});
