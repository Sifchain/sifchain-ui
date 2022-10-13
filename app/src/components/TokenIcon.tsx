import { IAsset } from "@sifchain/sdk";
import {
  defineComponent,
  HTMLAttributes,
  PropType,
  ref,
  Ref,
  watch,
} from "vue";

import { getTokenIconUrl } from "~/utils/getTokenIconUrl";

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
    return {
      url,
    };
  },
  render() {
    return (
      <div
        style={{
          height: this.size + "px",
          width: this.size + "px",
          backgroundImage: `url('${this.url}')`,
          // set to the size of the icon
          // backgroundSize: `${props.size}px ${props.size}px`,
          backgroundPosition: "center center",
          backgroundSize: `contain`,
          backgroundRepeat: "no-repeat",
          filter: (this.asset?.value || this.assetValue)?.hasDarkIcon
            ? "invert(100%) hue-rotate(-180deg)"
            : "",
        }}
        class={[
          `overflow-hidden rounded-full ring-1 ring-black/90 transition-all duration-100`,
          this.class,
        ]}
      />
    );
  },
});

export default TokenIcon;
