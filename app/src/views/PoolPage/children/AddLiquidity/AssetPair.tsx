import { defineComponent, PropType, ComputedRef, ref } from "vue";
import { Asset, IAsset } from "@sifchain/sdk";

import { TokenIcon } from "~/components/TokenIcon";

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
          <div class="z-10 translate-x-1 overflow-hidden rounded-full bg-black ring-2 ring-black/90">
            <TokenIcon asset={props.asset} size={32} />
          </div>
          <div class="grid place-items-center overflow-hidden rounded-full bg-black ring ring-black/90">
            <TokenIcon asset={ref(Asset("rowan"))} size={30} />
          </div>
        </div>
      );
  },
});
