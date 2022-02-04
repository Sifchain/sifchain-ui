import { RouterView } from "vue-router";
import { defineComponent, ref, computed, onMounted } from "vue";
import { effect } from "@vue/reactivity";
import { Network } from "@sifchain/sdk";

import Layout from "@/componentsLegacy/Layout/Layout";
import AssetIcon from "@/components/AssetIcon";
import PageCard from "@/components/PageCard";

import { Tooltip } from "@/components/Tooltip";
import { SearchBox } from "@/components/SearchBox";
import RecyclerView from "@/components/RecyclerView";
import { Button } from "@/components/Button/Button";

import BalanceRow from "./BalanceRow";
import { BalancePageState, useBalancePageData } from "./useBalancePageData";
import { getImportLocation } from "./Import/useImportData";

const PAGE_SIZE = 20;
const ROW_HEIGHT = 50;

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
    let isDisabled = false;

    const showZeroBalance = ref(true);

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

    const allBalances = computed(() =>
      showZeroBalance.value || state.searchQuery.length
        ? displayedTokenList.value
        : displayedTokenList.value.filter((x) => x.amount.greaterThan("0")),
    );

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
        class: "text-right pl-[42px] whitespace-nowrap",
        ref: ref<HTMLElement>(),
      },
    ];

    const colStyles = computed(() =>
      columns.map((col) => ({
        width: `${col.ref.value?.getBoundingClientRect().width}px`,
      })),
    );

    return () => (
      <Layout>
        <PageCard
          heading={<div class="flex items-center">Balances</div>}
          headerAction={
            <div class="flex gap-2 items-center">
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
                />
              </Tooltip>
              <label class="flex items-center mr-[16px] opacity-80">
                <input
                  type="checkbox"
                  class="mr-[4px]"
                  checked={showZeroBalance.value}
                  onChange={(e) =>
                    (showZeroBalance.value = (
                      e.target as HTMLInputElement
                    ).checked)
                  }
                />
                Show 0 Balances
              </label>
              <Button.Inline
                onClick={() => {}}
                class="!h-[40px] px-[17px] text-md relative"
                icon="interactive/plus"
                iconClass="!w-[24px] !h-[24px] transform translate-y-[1px]"
                to={getImportLocation("select", {
                  symbol: "rowan",
                  network: Network.COSMOSHUB,
                })}
                active
              >
                Import
              </Button.Inline>
            </div>
          }
          iconName="navigation/balances"
          class="w-[800px]"
          withOverflowSpace
          headerContent={
            <div class="w-full">
              <SearchBox
                enableKeyBindings
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
              <tr class="block">
                {columns.map((column) => (
                  <td
                    ref={column.ref}
                    class={[column.class, "whitespace-nowrap"]}
                    key={column.name}
                  />
                ))}
                <td /> {/* Actions */}
                <td />
              </tr>
            </thead>
            {!allBalances.value.length && Boolean(state.searchQuery.length) && (
              <tbody class="w-full relative">
                <tr>
                  <td class="block pb-4">
                    <div class="p-4 grid place-items-center bg-gray-200 rounded-md">
                      <span class="text-lg">
                        No results matching{" "}
                        <span class="text-accent-base">
                          "{state.searchQuery}"
                        </span>
                      </span>
                    </div>
                  </td>
                </tr>
              </tbody>
            )}
            <RecyclerView
              as="tbody"
              class="w-full relative overflow-y-scroll"
              data={allBalances.value}
              rowHeight={ROW_HEIGHT}
              visibleRows={PAGE_SIZE}
              renderItem={(item) => (
                <BalanceRow
                  key={item.asset.symbol + item.asset.network}
                  tokenItem={item}
                  expandedSymbol={state.expandedSymbol}
                  onSetExpandedSymbol={(symbol) => {
                    state.expandedSymbol = symbol;
                  }}
                />
              )}
            />
          </table>
        </PageCard>
        <RouterView
          name={!isReady.value ? "DISABLED_WHILE_LOADING" : undefined}
        />
      </Layout>
    );
  },
});
