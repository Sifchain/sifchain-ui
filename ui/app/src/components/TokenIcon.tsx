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

const defaultIcon = `anim-racetrack-spinner`;
const imagesLoadedCache: Record<string, string> = {};
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
    const svgIconsUrl = computed(() => {
      return "";
      // return (
      //   icons[props.symbol.value] ??
      //   icons[props.symbol.value.replace(/^c/, "")] ??
      //   icons["e" + props.symbol.value]
      // );
    });
    const url = ref<string | void>();
    const hasLoaded = ref(false);
    watch(
      () => [props.asset?.value, props.assetValue],
      async ([asset, asset2]) => {
        hasLoaded.value = false;
        url.value = `/images/tokens/${defaultIcon}.svg`;
        asset = asset || asset2;
        if (!asset) return;

        const svgSrc = `/images/tokens/${(
          asset?.displaySymbol || asset?.symbol
        )?.toUpperCase()}.svg`;

        if (imagesLoadedCache[asset.displaySymbol]) {
          hasLoaded.value = true;
          url.value = imagesLoadedCache[asset.displaySymbol];
          return;
        }
        const image = new Image();
        image.src = svgSrc;
        image.onload = () => {
          // if asset has changed since image started loading, exit
          if (props.asset?.value?.symbol !== asset?.symbol) return;
          imagesLoadedCache[svgSrc] = svgSrc;
          url.value = svgSrc;
          hasLoaded.value = true;
        };
        image.onerror = () => {
          // if asset has changed since image started loading, exit
          if (props.asset?.value?.symbol !== asset?.symbol) return;
          const coinGeckoUrl = core.config.assets
            .find((a) => a.symbol == asset?.symbol)
            ?.imageUrl?.replace("thumb", "large");
          if (coinGeckoUrl) {
            const image = new Image();
            image.src = coinGeckoUrl;
            image.onload = () => {
              url.value = coinGeckoUrl;
              if (asset) imagesLoadedCache[asset?.displaySymbol] = coinGeckoUrl;
              hasLoaded.value = true;
            };
          }
        };
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
        class={[`transition-allz duration-100`, props.class]}
      />
    );
  },
});
