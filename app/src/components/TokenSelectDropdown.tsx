import { IAsset, Network } from "@sifchain/sdk";
import {
  computed,
  defineComponent,
  onMounted,
  onUnmounted,
  PropType,
  Ref,
  ref,
  Teleport,
  watch,
} from "vue";

import AssetIcon from "~/components/AssetIcon";
import { formatAssetAmount } from "~/components/utils";
import { useCore } from "~/hooks/useCore";
import { TokenListItem, useTokenList } from "~/hooks/useToken";
import { sortAndFilterTokens, TokenSortBy } from "~/utils/sortAndFilterTokens";
import { TokenNetworkIcon } from "./TokenNetworkIcon/TokenNetworkIcon";

export const TokenSelectDropdown = defineComponent({
  props: {
    active: {
      type: Object as PropType<Ref<boolean> | boolean>,
      required: true,
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
    hideBalances: {
      type: Boolean as PropType<boolean>,
      default: false,
    },
    excludeSymbols: {
      type: Array as PropType<Array<string>>,
      required: false,
      default: () => [],
    },
    sortBy: {
      type: [String, Function] as PropType<
        TokenSortBy | ((a: TokenListItem, b: TokenListItem) => number)
      >,
      required: false,
      default: () => "symbol",
    },
  },
  setup(props) {
    const core = useCore();
    const selfRoot = ref<HTMLDivElement | null>(null);
    const dropdownRoot = ref<HTMLDivElement | null>(null);
    const iconScrollContainer = ref<HTMLDivElement | null>(null);

    const activeRef = computed(() => {
      return typeof props.active === "boolean"
        ? props.active
        : props.active.value;
    });

    const searchQuery = ref("");
    const networksRef = computed(() => {
      const net = props.network?.value;
      return [net || Network.SIFCHAIN];
    });

    const tokensRef = useTokenList({
      networks: networksRef,
    });
    const sortedAndFilteredTokens = computed(() => {
      const excludeSymbolsSet = new Set(
        props.excludeSymbols.map((s) => s.toLowerCase()),
      );
      return sortAndFilterTokens({
        tokens: tokensRef.value,
        searchQuery: searchQuery.value,
        sortBy: props.sortBy,
        network: networksRef.value[0],
      }).filter((token) => {
        return !excludeSymbolsSet.has(token.asset.symbol.toLowerCase());
      });
    });

    const boundingClientRect = ref<DOMRect | undefined>();
    const resizeListener = ref(() => {
      boundingClientRect.value = selfRoot.value?.getBoundingClientRect();
    });
    const externalClickListener = ref((e: Event) => {
      // Timeout: if the click to close happens same time as a click to open,
      // make this happen after so it really closes it.
      // This is for example, for a click on the toggle open button.
      setTimeout(() => {
        if (
          !dropdownRoot.value?.contains(e.target as HTMLElement) &&
          !selfRoot.value?.contains(e.target as HTMLElement) &&
          !(e as any).handled
        ) {
          props.onCloseIntent?.();
        }
      }, 1);
    });

    watch(
      activeRef,
      () => {
        if (activeRef.value) {
          // If a click is still in progress, we don't want to attach this listener yet.
          window.requestAnimationFrame(() => {
            document.body.addEventListener(
              "click",
              externalClickListener.value,
              true,
            );
          });
        } else {
          document.body.removeEventListener(
            "click",
            externalClickListener.value,
            true,
          );
        }
      },
      { immediate: true, deep: true },
    );

    watch([activeRef.value], () => {
      let frameId: number;
      if (activeRef.value) {
        frameId = window.requestAnimationFrame(() => {
          dropdownRoot.value?.querySelector("input")?.focus();
        });
      }
      const rect = selfRoot.value?.getBoundingClientRect();
      if (
        rect?.x !== boundingClientRect.value?.x ||
        rect?.y !== boundingClientRect.value?.y
      ) {
        boundingClientRect.value = rect;
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
      <div ref={selfRoot} class="h-0 w-full">
        {
          <Teleport to="#portal-target">
            {activeRef.value && (
              <div
                ref={dropdownRoot}
                style={{
                  boxShadow: "0px 20px 20px 0px #00000080",
                  position: "absolute",
                  top: (boundingClientRect.value?.y ?? 0) + "px",
                  left: (boundingClientRect.value?.x ?? 0) + "px",
                }}
                class=" bg-gray-input border-gray-input_outline z-50 mt-[7px] w-[440px] overflow-hidden rounded-[4px] border-[1px] border-solid"
              >
                <div class="h-full w-full py-[20px] px-[15px]">
                  <div class="bg-gray-base border-gray-input_outline relative flex h-8 w-full items-center overflow-hidden rounded-lg border-[1px] border-solid">
                    <AssetIcon
                      size={20}
                      icon="interactive/search"
                      class="ml-3 h-4 w-4"
                    />
                    <input
                      id="token-search"
                      autofocus
                      type="search"
                      placeholder="Search Token..."
                      autocomplete="off"
                      onKeydown={(e: Event) => {
                        if (
                          (e as KeyboardEvent).key === "Enter" &&
                          sortedAndFilteredTokens.value.length > 0
                        ) {
                          props.onSelectAsset?.(
                            sortedAndFilteredTokens.value[0].asset,
                          );
                          searchQuery.value = "";
                        }
                      }}
                      value={searchQuery.value}
                      onInput={(e: Event) => {
                        searchQuery.value = (
                          e.target as HTMLInputElement
                        ).value;
                      }}
                      class="absolute top-0 bottom-0 left-0 right-0 box-border h-full w-full bg-transparent pl-8 pr-3 font-sans font-medium text-white outline-none"
                    />
                  </div>
                  <div
                    ref={iconScrollContainer}
                    class="relative w-full overflow-hidden"
                  >
                    <div class="flex w-full justify-between px-[3px] py-[8px] font-normal">
                      <div>Token Name</div>
                      <div>{!props.hideBalances && "Balance"}</div>
                    </div>
                    <div class="relative mr-[-15px] h-[302px] w-full">
                      <div class="absolute inset-0 h-full w-full overflow-y-scroll">
                        {sortedAndFilteredTokens.value.map((token) => {
                          return (
                            <div
                              onClick={(e: MouseEvent) => {
                                props.onSelectAsset?.(token.asset);
                                (e as any).handled = true;
                              }}
                              key={token.asset.symbol}
                              class="list-complete-item hover:bg-gray-base flex w-full cursor-pointer items-center px-[8px] py-[4px] font-medium uppercase"
                            >
                              <TokenNetworkIcon
                                key={token.asset.symbol}
                                size={20}
                                assetValue={token.asset}
                                class="mr-[8px]"
                              />
                              {token.asset.displaySymbol || token.asset.symbol}
                              <div class="ml-[8px] flex-1" />
                              {props.hideBalances
                                ? ""
                                : formatAssetAmount(token.amount)}
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
