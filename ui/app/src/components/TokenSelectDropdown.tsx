import { formatAssetAmount } from "@/componentsLegacy/shared/utils";
import AssetIcon from "@/components/AssetIcon";
import { useCore } from "@/hooks/useCore";
import {
  computed,
  defineComponent,
  effect,
  onMounted,
  onUnmounted,
  PropType,
  Ref,
  ref,
  Teleport,
  TransitionGroup,
  watch,
  watchEffect,
} from "vue";
import { IAsset, Network } from "../../../core/src";
import { TokenIcon } from "./TokenIcon";
import { sortAndFilterTokens, TokenSortBy } from "@/utils/sortAndFilterTokens";
import { TokenListItem, useTokenList } from "@/hooks/useToken";
import { VirtualScroller } from './VirtualScroller'
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
    const listContainer = ref<HTMLDivElement | null>(null);
    const highlightedToken = ref<HTMLLIElement | null>(null)

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

    const SETTINGS = {
      minIndex: 0,
      maxIndex: sortedAndFilteredTokens.value.length,
      startIndex: 1,
      itemHeight: 20,
      amount: 12,
      tolerance: 2
    }
    console.log('settings', SETTINGS)

    const getData = (offset, limit) => {
      const data = []
      const start = Math.max(SETTINGS.minIndex, offset)
      const end = Math.min(offset + limit - 1, SETTINGS.maxIndex)
      if (start <= end) {
        for (let i = start; i <= end; i++) {
          data.push({ index: i, text: `item${i}` })
        }
      }
      return data
    }


    // var duration = '16'
    var ticking = false
    var listTop: number;
    var listBottom: number;
    var isArrowUp = false
    var currentIndex: number;
    var nextHighlightedItem: HTMLLIElement | null;
    var nextHighlightedItemTop: number;
    var nextHighlightedItemBottom: number;
    var startTime = 0;
    var scrollDownValue = 0
    var scrollUpValue = 0

    function requestTick() {

      if (!ticking) {
        currentIndex = parseInt(highlightedToken.value?.dataset?.fromAmountSymbolDropdownIndex || '0') || 0;
        // next highlighted item will be set based on whether user arrows up or down
        nextHighlightedItem = listContainer.value?.querySelector(`[data-from-amount-symbol-dropdown-index='${!isArrowUp ? currentIndex + 1 : currentIndex - 1}']`);

        // get the top and bottom dimensions of the new item to highlight and the parent list container to set scroll position later
        nextHighlightedItemTop = nextHighlightedItem?.getBoundingClientRect().top || 0;
        nextHighlightedItemBottom = nextHighlightedItem?.getBoundingClientRect().bottom || 0;
        scrollUpValue = nextHighlightedItemTop - listTop
        scrollDownValue = nextHighlightedItemBottom - listBottom
        requestAnimationFrame(rAFCallback);
        ticking = true
      }
    }
    function rAFCallback(timeStamp) {
      // if (isArrowUp) {
      //   listContainer.value.scrollBy({
      //     top: -29,
      //     behavior: 'smooth'
      //   });
      // } else listContainer.value.scrollBy({
      //   top: 29,
      //   behavior: 'smooth'
      // });

      // trigger style recalculations and paint last as to improve scrolling performance and keep fps down
      // scroll selected item into view if overflowing
      if (isArrowUp && nextHighlightedItemTop < listTop) {
        listContainer.value.scrollBy({
          top: scrollUpValue,
          behavior: 'smooth'
        });
      } else if (!isArrowUp && nextHighlightedItemBottom > listBottom) {
        listContainer.value.scrollBy({
          top: scrollDownValue,
          behavior: 'smooth'
        });
      }
      // // handle adding background to first element
      if (!highlightedToken.value?.classList.contains('bg-gray-base')) {
        highlightedToken.value?.classList.add('bg-gray-base');
      } else {
        // return if hit the last element in list
        if (!isArrowUp && currentIndex === sortedAndFilteredTokens.value.length - 1) {
          ticking = false
          return
        } else if (isArrowUp && currentIndex === 0) {
          highlightedToken.value = listContainer.value?.querySelector("[data-from-amount-symbol-dropdown-index='0']");
        }
        // otherwise set the next item to highlight
        highlightedToken.value.classList.remove('bg-gray-base');
        nextHighlightedItem?.classList.add('bg-gray-base');
      }
      const now = performance.now()
      if (now - timeStamp < 1600) {
        ticking = false
      }
    }
    const handleDropdownArrowNavigation = () => {
      if (!listTop || !listBottom) {
        listTop = listContainer.value?.getBoundingClientRect().top || 0;
        listBottom = listContainer.value?.getBoundingClientRect().bottom || 0;
      }
      if (!highlightedToken.value) {
        highlightedToken.value = listContainer.value?.querySelector("[data-from-amount-symbol-dropdown-index='0']");
      } else highlightedToken.value = listContainer.value?.querySelector("[data-from-amount-symbol-dropdown-index].bg-gray-base");
      requestTick()
    }

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

    watch(activeRef, () => {
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
      <div ref={selfRoot} class="w-full h-0">
        {
          <Teleport to="#portal-target">
            {activeRef.value && (
              <div
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
                class=" overflow-hidden bg-gray-input border-gray-input_outline border-solid border-[1px] w-[440px] mt-[7px] z-50 rounded-[4px]"
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
                      onKeydown={(e: Event) => {
                        if (
                          (e as KeyboardEvent).key === "Enter" &&
                          sortedAndFilteredTokens.value.length > 0
                        ) {
                          const selectedToken = highlightedToken.value?.querySelector('span')?.innerText.toLowerCase();
                          const tokenMatch = sortedAndFilteredTokens.value.find(({ amount }) => {
                            return selectedToken === amount.displaySymbol || selectedToken === amount.symbol;
                          })
                          props.onSelectAsset(
                            tokenMatch?.asset || sortedAndFilteredTokens.value[0].asset
                          );
                          searchQuery.value = "";
                        }
                        else if ((e as KeyboardEvent).key === 'Escape') {
                          props.onCloseIntent();
                        } else if ((e as KeyboardEvent).key === 'ArrowDown' || (e as KeyboardEvent).key === 'ArrowUp' && sortedAndFilteredTokens.value.length > 0) {
                          (e as KeyboardEvent).key === 'ArrowUp' ? isArrowUp = true : isArrowUp = false
                          handleDropdownArrowNavigation();
                        }
                      }}
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
                    id="fromTokenSymbolSelectContainer"
                  >
                    <div class="justify-between flex w-full font-normal px-[3px] py-[8px]">
                      <div>Token Name</div>
                      <div>{!props.hideBalances && "Balance"}</div>
                    </div>
                    <div class="w-full h-[302px] relative mr-[-15px]">
                      <div class="absolute inset-0 w-full h-full overflow-y-scroll" ref={listContainer} style={{ willChange: 'transform' }}>
                        <VirtualScroller settings={SETTINGS} get={getData} />
                        {/* <ol>
                          {sortedAndFilteredTokens.value.map((token, index) => {
                            return (
                              <li
                                onClick={(e: MouseEvent) => {
                                  props.onSelectAsset(token.asset);
                                  (e as any).handled = true;
                                }}
                                data-from-amount-symbol-dropdown-index={index}
                                key={token.asset.symbol}
                                class="list-complete-item flex w-full px-[8px] py-[4px] hover:bg-gray-base cursor-pointer items-center font-medium uppercase"
                              >
                                <TokenIcon
                                  key={token.asset.symbol}
                                  size={20}
                                  assetValue={token.asset}
                                  class="mr-[8px]"
                                />
                                <span>{token.asset.displaySymbol || token.asset.symbol}</span>
                                <div class="flex-1 ml-[8px]" />
                                {props.hideBalances
                                  ? ""
                                  : formatAssetAmount(token.amount)}
                              </li>
                            );
                          })}
                        </ol> */}
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

export const RowTemplate = defineComponent({
  props: { item: { type: Object, required: true } },
  setup(props) {
    return () => (<li class="item" key={props.item.index} >
      {props.item.text}
    </li >)
  }
