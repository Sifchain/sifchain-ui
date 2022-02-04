import {
  defineComponent,
  TransitionGroup,
  ref,
  computed,
  Transition,
  KeepAlive,
  onMounted,
  watch,
} from "vue";
import Layout from "@/componentsLegacy/Layout/Layout";
import AssetIcon from "@/components/AssetIcon";
import PageCard from "@/components/PageCard";
import BalanceRow from "./BalanceRow";
import { BalancePageState, useBalancePageData } from "./useBalancePageData";
import { RouterView } from "vue-router";

import { effect } from "@vue/reactivity";
import router from "@/router";
import { Button } from "@/components/Button/Button";
import { Tooltip } from "@/components/Tooltip";
import { SearchBox } from "@/components/SearchBox";
import { debounce } from "../utils/debounce";

export default defineComponent({
  name: "BalancePage",
  props: {},
  setup() {
    const { state, displayedTokenList } = useBalancePageData({
      searchQuery: "",
      expandedSymbol: "",
      sortBy: "symbol",
      reverse: false,
    });

    // There's a bug with refreshing while an import child route is open
    // right as balance page loads... this "fixes" it. TODO: find real cause.
    let isReady = ref(false);
    onMounted(() => {
      setTimeout(() => {
        isReady.value = true;
      }, 1000);
    });

    effect(() => {
      if (state.searchQuery) {
        state.expandedSymbol = "";
      }
    });

    const columns = [
      {
        name: "Token",
        sortBy: "symbol" as BalancePageState["sortBy"],
        class: "text-left min-w-[150px]",
        ref: ref<HTMLElement>(),
      },
      {
        name: "Sifchain Balance",
        sortBy: "balance" as BalancePageState["sortBy"],
        class: "text-right",
        ref: ref<HTMLElement>(),
      },
    ];
    const colStyles = computed(() => {
      return columns.map((col) => {
        return {
          width: `${col.ref.value?.getBoundingClientRect().width}px`,
        };
      });
    });
    let isDisabled = false;
    const rowContainerRef = ref<HTMLDivElement | null>(null);
    const rowRef = ref<any | null>(null);
    const scrollProgress = ref(0);
    const startIndex = ref(0);
    const renderCount = ref(5);
    const renderedTokenList = computed(() => {
      return displayedTokenList.value.slice(
        startIndex.value,
        startIndex.value + renderCount.value,
      );
    });
    const rowHeight = ref(0);
    const rowTop = ref(0);
    watch([rowRef], () => {
      if (typeof rowRef.value?.$el?.scrollHeight !== "number") {
        return;
      }
      rowHeight.value = rowRef.value.$el.getBoundingClientRect().height;
      rowTop.value = rowRef.value.$el.getBoundingClientRect().top;
    });
    watch([rowContainerRef], () => {
      const height = window.innerHeight * 1.2;
      console.log({ height });
      if (!height && typeof height !== "number") {
        return;
      }
      renderCount.value = Math.floor(height / rowHeight.value);
    });
    const scrollHandler = debounce((e: UIEvent) => {
      const container = rowContainerRef.value;
      if (!container) return;
      const target = e.target as HTMLDivElement;
      console.log("scrolling");
      console.log(
        target.scrollTop,
        container.offsetTop,
        container.clientHeight,
        rowHeight.value,
        container.scrollTop,
        container.clientTop,
      );
      scrollProgress.value =
        Math.max(-container.getBoundingClientRect().top / rowHeight.value, 0) /
        displayedTokenList.value.length;
      startIndex.value = Math.floor(
        scrollProgress.value * displayedTokenList.value.length,
      );
      console.log(
        startIndex.value,
        scrollProgress.value,
        -container.getBoundingClientRect().top,
      );
    }, 200);
    return () => (
      <Layout onScroll={scrollHandler}>
        <PageCard
          heading={<div class="flex items-center">Balances</div>}
          headerAction={
            <Tooltip
              content={
                <>
                  These are your balances within Sifchain. Press Import to bring
                  your tokens in from other chains. Then you can swap, provide
                  liquidity, and export to other chains.
                </>
              }
            >
              <AssetIcon
                icon="interactive/help"
                class="text-gray-300 transition-all hover:text-accent-base opacity-100 hover:opacity-50 cursor-pointer mt-[4px] mr-[2px]"
                size={24}
              ></AssetIcon>
            </Tooltip>
          }
          iconName="navigation/balances"
          class="w-[800px]"
          withOverflowSpace
          headerContent={
            <div class="w-full">
              <SearchBox
                value={state.searchQuery}
                disabled={isDisabled}
                placeholder="Search Token..."
                onInput={(e: Event) => {
                  state.searchQuery = (e.target as HTMLInputElement).value;
                }}
              />
              <div class="h-4 w-full" />
              {displayedTokenList.value.length > 0 && (
                <div class="pb-[5px] mb-[-5px] w-full flex flex-row justify-start">
                  <div class="relative w-full flex flex-row justify-start font-medium text-sm align-text-bottom">
                    {columns.map((column, index) => (
                      <div
                        style={colStyles.value[index]}
                        class={[column.class]}
                        key={column.name}
                      >
                        <div
                          class="inline-flex items-center cursor-pointer opacity-50 hover:opacity-60"
                          onClick={() => {
                            if (state.sortBy === column.sortBy) {
                              state.reverse = !state.reverse;
                            } else {
                              state.reverse = false;
                            }
                            state.sortBy = column.sortBy;
                          }}
                        >
                          {column.name}
                          {state.sortBy === column.sortBy && (
                            <AssetIcon
                              icon="interactive/arrow-down"
                              class="transition-all w-[12px] h-[12px]"
                              style={{
                                transform: state.reverse
                                  ? "rotate(0deg)"
                                  : "rotate(180deg)",
                              }}
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          }
        >
          <table class="w-full">
            <thead>
              <tr>
                {columns.map((column, index) => (
                  <td
                    ref={column.ref}
                    class={[column.class]}
                    key={column.name}
                  ></td>
                ))}
                <td /> {/* Actions */}
                <td></td>
              </tr>
            </thead>
            <tbody ref={rowContainerRef} class="w-full relative">
              <hr
                style={{
                  paddingTop: `${startIndex.value * rowHeight.value}px`,
                  transition: "all 0s linear",
                }}
              />
              {renderedTokenList.value.map((item, index) => (
                <BalanceRow
                  ref={
                    item === displayedTokenList.value[0] ? rowRef : undefined
                  }
                  key={item.asset.symbol + item.asset.network}
                  tokenItem={item}
                  expandedSymbol={state.expandedSymbol}
                  onSetExpandedSymbol={(symbol) => {
                    state.expandedSymbol = symbol;
                  }}
                />
              ))}
              <hr
                style={{
                  paddingTop: `${
                    displayedTokenList.value.length * rowHeight.value -
                    (startIndex.value + renderCount.value) * rowHeight.value
                  }px`,
                  transition: "all 0s linear",
                }}
              />
            </tbody>
          </table>
        </PageCard>
        <RouterView
          name={!isReady.value ? "DISABLED_WHILE_LOADING" : undefined}
        ></RouterView>
      </Layout>
    );
  },
});
