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
import { getTokenIconUrl } from "@/utils/getTokenIconUrl";

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
        url.value = getTokenIconUrl(asset);
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
          backgroundPosition: "center center",
          backgroundSize: `contain`,
          backgroundRepeat: "no-repeat",
        }}
        class={[`transition-all duration-100`, props.class]}
      />
    );
  },
});
