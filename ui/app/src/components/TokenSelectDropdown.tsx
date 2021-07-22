import { formatAssetAmount } from "@/componentsLegacy/shared/utils";
import AssetIcon from "@/components/AssetIcon";
import { useCore } from "@/hooks/useCore";
import {
  computed,
  defineComponent,
  nextTick,
  onMounted,
  onUnmounted,
  onUpdated,
  PropType,
  Ref,
  ref,
  Teleport,
  Transition,
  TransitionGroup,
  watch,
} from "vue";
import { IAsset, Network } from "../../../core/src";
import { TokenIcon } from "./TokenIcon";
import { sortAndFilterTokens, TokenSortBy } from "@/utils/sortAndFilterTokens";
import { useTokenList } from "@/hooks/useToken";

export const TokenSelectDropdown = defineComponent({
  props: {
    active: {
      type: Object as PropType<Ref<boolean>>,
      required: false,
    },
    onCloseIntent: {
      type: Function,
      required: true,
    },
    onSelectAsset: {
      type: Function as PropType<(asset: IAsset) => any>,
      required: true,
    },
    network: {
      type: Object as PropType<Ref<Network>>,
      required: false,
    },
    sortBy: {
      type: String as PropType<TokenSortBy>,
      required: false,
      default: () => "balance",
    },
  },
  setup(props) {
    const core = useCore();
    const selfRoot = ref<HTMLDivElement | null>(null);
    const dropdownRoot = ref<HTMLDivElement | null>(null);
    const iconScrollContainer = ref<HTMLDivElement | null>(null);

    const searchQuery = ref("");
    const networksRef = computed(() =>
      !props.network ? [Network.SIFCHAIN] : [props.network.value],
    );

    const tokensRef = useTokenList({
      networks: networksRef,
    });
    const sortedAndFilteredTokens = computed(() => {
      return sortAndFilterTokens({
        tokens: tokensRef.value,
        searchQuery: searchQuery.value,
        sortBy: props.sortBy,
      });
    });

    const boundingClientRect = ref<DOMRect | undefined>();
    const resizeListener = ref(() => {
      boundingClientRect.value = selfRoot.value?.getBoundingClientRect();
    });
    const externalClickListener = ref(() => {
      props.onCloseIntent?.();
    });

    watch(
      [props.active],
      () => {
        if (props.active?.value) {
          document.body.addEventListener("click", externalClickListener.value);
        } else {
          document.body.removeEventListener(
            "click",
            externalClickListener.value,
          );
        }
      },
      { immediate: true },
    );
    onMounted(() => {
      if (props.active) {
        document.documentElement.addEventListener(
          "click",
          externalClickListener.value,
        );
      }
    });

    onUnmounted(() => {
      document.documentElement.removeEventListener(
        "click",
        externalClickListener.value,
      );
    });

    watch([props.active], () => {
      const rect = selfRoot.value?.getBoundingClientRect();
      if (
        rect?.x === boundingClientRect.value?.x &&
        rect?.y === boundingClientRect.value?.y
      ) {
        return;
      }
      boundingClientRect.value = rect;

      let frameId: number;
      if (props.active?.value) {
        frameId = window.requestAnimationFrame(() => {
          dropdownRoot.value?.querySelector("input")?.focus();
        });
      }
      return () => window.cancelAnimationFrame(frameId);
    });
    onMounted(() => {
      resizeListener.value();
      window.addEventListener("resize", resizeListener.value);
    });
    onUnmounted(() => {
      window.removeEventListener("resize", resizeListener.value);
    });

    return () => (
      <div ref={selfRoot} class="w-full h-0">
        {
          <Teleport to="#portal-target">
            {props.active?.value && (
              <div
                onClick={(e: MouseEvent) => {
                  // don't include in body click event listener
                  e.stopPropagation();
                }}
                ref={dropdownRoot}
                style={{
                  boxShadow: "0px 20px 20px 0px #00000080",
                  position: "absolute",
                  top: (boundingClientRect.value?.y ?? 0) + "px",
                  left:
                    (boundingClientRect.value?.x ?? 0) +
                    // (boundingClientRect.value?.width ?? 0) +
                    "px",
                }}
                class=" overflow-hidden bg-gray-input border-gray-input_outline border-solid border-[1px] w-[450px] mt-[7px] z-50 rounded-[4px]"
              >
                <div class="w-full h-full py-[20px] px-[15px]">
                  <div class="w-full bg-gray-base border-gray-input_outline border-[1px] border-solid h-8 relative flex items-center rounded-lg overflow-hidden">
                    <AssetIcon
                      size={20}
                      icon="interactive/search"
                      class={[`ml-3 w-4 h-4`, false ? "text-[#6E6E6E]" : ""]}
                    />
                    <input
                      id="token-search"
                      autofocus
                      type="search"
                      placeholder="Search Token..."
                      value={searchQuery.value}
                      onInput={(e: Event) => {
                        searchQuery.value = (e.target as HTMLInputElement).value;
                      }}
                      class="box-border w-full absolute top-0 bottom-0 left-0 right-0 pl-8 pr-3 h-full bg-transparent outline-none text-white font-sans font-medium"
                    />
                  </div>
                  <div
                    ref={iconScrollContainer}
                    class="w-full overflow-hidden relative"
                  >
                    <div class="justify-between flex w-full font-normal px-[3px] py-[8px]">
                      <div>Token Name</div>
                      <div>Balance</div>
                    </div>
                    <div class="w-full h-[302px] relative mr-[-15px]">
                      <div class="absolute inset-0 w-full h-full overflow-y-scroll">
                        {sortedAndFilteredTokens.value.map((token) => {
                          return (
                            <div
                              onClick={(e: MouseEvent) => {
                                props.onSelectAsset(token.asset);
                              }}
                              key={token.asset.symbol}
                              class="flex w-full px-[8px] py-[4px] hover:bg-gray-base cursor-pointer items-center font-medium uppercase"
                            >
                              <TokenIcon
                                size={20}
                                assetValue={token.asset}
                                class="mr-[8px]"
                              />
                              {token.asset.displaySymbol || token.asset.symbol}
                              <div class="flex-1 ml-[8px]" />
                              {formatAssetAmount(token.amount)}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Teleport>
        }
      </div>
    );
  },
});
