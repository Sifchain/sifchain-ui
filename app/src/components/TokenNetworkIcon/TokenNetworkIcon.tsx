import {
  computed,
  defineComponent,
  HTMLAttributes,
  PropType,
  ref,
  Ref,
  watch,
} from "vue";
import { IAsset } from "@sifchain/sdk";

import { useChains } from "~/hooks/useChains";
import { isLikeSymbol } from "~/utils/symbol";
import { TokenIcon } from "../TokenIcon";
import { Tooltip } from "../Tooltip";
import AssetIcon from "../AssetIcon";

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

    let isLoadingRef = ref(true);
    let loadingCounterIdRef = ref(0);

    watch(
      [assetRef],
      () => {
        let nextCounter = loadingCounterIdRef.value + 1;
        loadingCounterIdRef.value = nextCounter;
        isLoadingRef.value = true;
        setTimeout(() => {
          if (loadingCounterIdRef.value === nextCounter) {
            isLoadingRef.value = false;
          }
        }, 1000);
      },
      {
        immediate: true,
      },
    );

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
            {isLoadingRef.value ? (
              <AssetIcon
                size={props.size}
                icon="interactive/anim-racetrack-spinner"
              ></AssetIcon>
            ) : (
              <TokenIcon asset={assetRef} size={props.size} />
            )}
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
                {isLoadingRef.value ? (
                  <AssetIcon
                    size={homeIconSize.value}
                    icon="interactive/anim-racetrack-spinner"
                  ></AssetIcon>
                ) : (
                  <TokenIcon
                    assetValue={homeAssetRef.value}
                    size={homeIconSize.value}
                  />
                )}
              </div>
            )}
          </div>
        </Tooltip>
      );
    };
  },
});
