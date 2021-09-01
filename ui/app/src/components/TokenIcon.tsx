import { useCore } from "@/hooks/useCore";
import { computed, ref, Ref } from "@vue/reactivity";
import {
  defineComponent,
  onMounted,
  PropType,
  watch,
  HTMLAttributes,
} from "vue";
import { IAsset } from "@sifchain/sdk";
import SvgSpinnerIcon from "../assets/icons/interactive/anim-circle-spinner.svg";

// Load all SVG icons with glob so that they get included as assets
// This will just give us their src string.
const globResult = import.meta.globEager("/images/tokens/*.svg");
const tokenSrcMap = Object.keys(globResult).reduce((map, key) => {
  // @ts-ignore
  const symbol = key
    .split("/")
    .pop()
    .replace(/\.svg$/i, "");
  map.set(symbol, globResult[key].default);
  return map;
}, new Map<string, string>());

export const TokenIcon = defineComponent({
  props: {
    asset: {
      type: Object as PropType<Ref<IAsset | undefined>>,
    },
    assetValue: {
      type: Object as PropType<IAsset | undefined>,
    },
    size: {
      type: Number,
      default: () => 20,
    },
    class: {
      type: [String, Object, Array] as HTMLAttributes["class"],
    },
  },
  setup(props) {
    const core = useCore();
    const url = ref<string | void>();

    watch(
      () => [props.asset?.value, props.assetValue],
      async ([asset, asset2]) => {
        asset = asset || asset2;
        if (!asset) return;

        const svgUrl = tokenSrcMap.get(asset.displaySymbol.toUpperCase());
        url.value =
          svgUrl ||
          core.config.assets
            .find((a) => a.symbol == asset?.symbol)
            ?.imageUrl?.replace("thumb", "large");
      },
      {
        immediate: true,
      },
    );
    return () => (
      <div
        style={{
          height: props.size + "px",
          width: props.size + "px",
          backgroundImage: `url('${url.value}')`,
          // set to the size of the icon
          // backgroundSize: `${props.size}px ${props.size}px`,
          backgroundSize: `contain`,
          backgroundRepeat: "no-repeat",
        }}
        class={[`transition-all duration-100`, props.class]}
      />
    );
  },
});
