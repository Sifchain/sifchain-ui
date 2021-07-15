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

    watch(
      () => props.asset?.value || props.assetValue,
      async (asset) => {
        if (!asset) return;
        const img = new Image();
        img.src = `/images/tokens/${(
          asset?.displaySymbol ?? asset?.symbol
        )?.toUpperCase()}.svg`;
        new Promise((r, rj) => {
          img.onerror = rj;
          img.onload = r;
        })
          .then(() => {
            url.value = img.src;
          })
          .catch((e) => {
            const coinGeckoUrl = core.config.assets
              .find((a) => a.symbol == asset?.symbol)
              ?.imageUrl?.replace("thumb", "large");
            url.value = coinGeckoUrl;
          });
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
          backgroundSize: `${props.size}px ${props.size}px`,
          backgroundRepeat: "no-repeat",
        }}
        class={[`transition-all duration-100`, props.class]}
      />
    );
  },
});
