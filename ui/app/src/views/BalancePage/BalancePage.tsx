import clsx from "clsx";
import { RouterView } from "vue-router";
import { defineComponent, ref, computed, onMounted } from "vue";
import { effect } from "@vue/reactivity";

import Layout from "@/componentsLegacy/Layout/Layout";
import AssetIcon from "@/components/AssetIcon";
import PageCard from "@/components/PageCard";

import { Tooltip } from "@/components/Tooltip";
import { SearchBox } from "@/components/SearchBox";

import BalanceRow from "./BalanceRow";
import { BalancePageState, useBalancePageData } from "./useBalancePageData";

const PAGE_SIZE = 20;

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

    const showZeroBalance = ref(true);
    const pageIndex = ref(0);

    const allBalances = computed(() =>
      showZeroBalance.value
        ? displayedTokenList.value
        : displayedTokenList.value.filter((x) => x.amount.greaterThan("0")),
    );

    const pageStart = computed(() => pageIndex.value * PAGE_SIZE);

    const page = computed(() =>
      allBalances.value.slice(pageStart.value, pageStart.value + PAGE_SIZE),
    );

    const pages = computed(() =>
      Math.ceil(allBalances.value.length / PAGE_SIZE),
    );

    return () => (
      <Layout>
        <PageCard
          heading={<div class="flex items-center">Balances</div>}
          headerAction={
            <div class="flex gap-2 items-center">
              <label class="flex items-center mr-[16px] opacity-80">
                <input
                  type="checkbox"
                  class="mr-[4px]"
                  checked={showZeroBalance.value}
                  onChange={(e) =>
                    (showZeroBalance.value = (e.target as HTMLInputElement).checked)
                  }
                />
                Show 0 Balances
              </label>
              <Tooltip
                content={
                  <>
                    These are your balances within Sifchain. Press Import to
                    bring your tokens in from other chains. Then you can swap,
                    provide liquidity, and export to other chains.
                  </>
                }
              >
                <AssetIcon
                  icon="interactive/help"
                  class="text-gray-300 transition-all hover:text-accent-base opacity-100 hover:opacity-50 cursor-pointer mt-[4px] mr-[2px]"
                  size={24}
                ></AssetIcon>
              </Tooltip>
            </div>
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
                {columns.map((column) => (
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
            <tbody class="w-full relative">
              {page.value.map((item) => (
                <BalanceRow
                  key={item.asset.symbol + item.asset.network}
                  tokenItem={item}
                  expandedSymbol={state.expandedSymbol}
                  onSetExpandedSymbol={(symbol) => {
                    state.expandedSymbol = symbol;
                  }}
                />
              ))}
            </tbody>
          </table>
          <div class="flex items-center gap-2 pt-4 pb-6 justify-center">
            <div
              role="button"
              class="outline outline-1 w-6 h-6 grid place-items-center"
              onClick={() => {
                if (pageIndex.value) pageIndex.value--;
              }}
            >
              «
            </div>
            {new Array(pages.value).fill(0).map((_, idx) => (
              <div
                role="button"
                class={clsx(
                  "outline outline-1 w-6 h-6 grid place-items-center",
                  {
                    "outline-accent-base text-accent-base font-semibold":
                      idx === pageIndex.value,
                  },
                )}
                onClick={() => {
                  pageIndex.value = idx;
                }}
              >
                {idx + 1}
              </div>
            ))}
            <div
              role="button"
              class="outline outline-1 w-6 h-6 grid place-items-center"
              onClick={() => {
                if (pageIndex.value < pages.value - 1) pageIndex.value++;
              }}
            >
              »
            </div>
          </div>
        </PageCard>
        <RouterView
          name={!isReady.value ? "DISABLED_WHILE_LOADING" : undefined}
        />
      </Layout>
    );
  },
});
