import {
  defineComponent,
  TransitionGroup,
  ref,
  computed,
  Transition,
  KeepAlive,
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
    return () => (
      <Layout>
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
              <div class="bg-gray-input h-8 relative flex items-center rounded-lg overflow-hidden focus-within:border-white rounded border border-solid border-gray-input_outline">
                <AssetIcon
                  size={20}
                  icon="interactive/search"
                  class={[`ml-3 w-4 h-4`, isDisabled ? "text-[#6E6E6E]" : ""]}
                />
                <input
                  type="search"
                  placeholder="Search Token..."
                  value={state.searchQuery}
                  onInput={(e: Event) => {
                    state.searchQuery = (e.target as HTMLInputElement).value;
                  }}
                  class="box-border w-full absolute top-0 bottom-0 left-0 right-0 pl-8 pr-3 h-full bg-transparent outline-none text-white font-sans font-medium text-md"
                />
              </div>
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
            <tbody class="w-full relative">
              {displayedTokenList.value.map((item, index) => (
                <BalanceRow
                  key={item.asset.symbol}
                  tokenItem={item}
                  expandedSymbol={state.expandedSymbol}
                  onSetExpandedSymbol={(symbol) => {
                    state.expandedSymbol = symbol;
                  }}
                />
              ))}
            </tbody>
          </table>
        </PageCard>
        <RouterView></RouterView>
      </Layout>
    );
  },
});
