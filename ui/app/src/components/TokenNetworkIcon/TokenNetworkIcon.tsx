import { useChains } from "@/hooks/useChains";
import { isLikeSymbol } from "@/utils/symbol";
import { IAsset, Network } from "@sifchain/sdk";
import {
  computed,
  defineComponent,
  HTMLAttributes,
  PropType,
  ref,
  Ref,
  watch,
} from "vue";
import { TokenIcon } from "../TokenIcon";
import { Tooltip } from "../Tooltip";

export const TokenNetworkIcon = defineComponent({
  name: "TokenNetworkIcon",
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
    const assetRef = computed(() => props.assetValue || props.asset?.value);
    const homeAssetRef = computed(() => {
      const asset = assetRef.value;
      if (!asset) return null;
      return asset.symbol.toLowerCase() === "rowan"
        ? null
        : useChains().get(asset.homeNetwork).nativeAsset;
    });

    const homeIconSize = computed(() => Math.max(props.size / 2, 12));

    return () => {
      if (!assetRef.value) return null;
      if (
        !homeAssetRef.value ||
        isLikeSymbol(assetRef.value.symbol, homeAssetRef.value.symbol)
      ) {
        return <TokenIcon {...props} />;
      }
      return (
        <Tooltip
          onShow={(instance) => {
            instance.setContent(
              `${
                useChains().get(assetRef.value!.homeNetwork).displayName
              } ${assetRef.value!.displaySymbol.toUpperCase()}`,
            );
          }}
        >
          <div
            class={["relative", props.class]}
            style={{
              width: props.size,
              height: props.size,
            }}
          >
            <TokenIcon asset={assetRef} size={props.size} />
            {!!homeAssetRef.value && (
              <div
                class="flex items-center justify-center rounded-full bg-gray-100"
                style={{
                  position: "absolute",
                  width: homeIconSize.value,
                  height: homeIconSize.value,
                  bottom: "-4px",
                  right: "-4px",
                }}
              >
                <TokenIcon
                  assetValue={homeAssetRef.value}
                  size={homeIconSize.value}
                />
              </div>
            )}
          </div>
        </Tooltip>
      );
    };
  },
});
