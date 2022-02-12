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
import Toggle from "@/components/Toggle";
import Button from "@/components/Button";

import BalanceRow from "./BalanceRowV2";
import { BalancePageState, useBalancePageData } from "./useBalancePageData";
import { getImportLocation } from "./Import/useImportData";
import { TokenListItem } from "@/hooks/useToken";

const ROW_HEIGHT = 50;

export default defineComponent({
  name: "BalancePage",
  props: {},

  setup() {
    const { state, displayedTokenList, isLoadingBalances } = useBalancePageData(
      {
        searchQuery: "",
        expandedSymbol: "",
        sortBy: "symbol",
        reverse: false,
      },
    );

    // There's a bug with refreshing while an import child route is open
    // right as balance page loads... this "fixes" it. TODO: find real cause.
    let isReady = ref(false);
    let isDisabled = false;

    const showAllBalances = ref(false);

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

    const handleExpandSymbol = (symbol: string) => {
      state.expandedSymbol = symbol;
    };

    const allBalances = computed<EnhancedTokenListItem[]>(() =>
      (showAllBalances.value || state.searchQuery.length
        ? displayedTokenList.value
        : displayedTokenList.value.filter((x) => x.amount.greaterThan("0"))
      ).map((rowItem) => ({
        ...rowItem,
        isExpanded: rowItem.asset.symbol === state.expandedSymbol,
        isMasked: Boolean(
          state.expandedSymbol && rowItem.asset.symbol !== state.expandedSymbol,
        ),
        onExpand: handleExpandSymbol,
      })),
    );

    const columns = [
      {
        name: "Token",
        sortBy: "symbol" as BalancePageState["sortBy"],
        class: "text-left w-[250px]",
        ref: ref<HTMLElement>(),
      },
      {
        name: "Sifchain Balance",
        sortBy: "balance" as BalancePageState["sortBy"],
        class: "text-right whitespace-nowrap",
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
              <Toggle
                label="Show all available"
                active={showAllBalances.value}
                onChange={(active) => {
                  showAllBalances.value = active;
                }}
              />
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
          headerContent={
            <div class="w-full grid gap-4">
              <SearchBox
                enableKeyBindings
                id="search-token"
                value={state.searchQuery}
                disabled={isDisabled}
                placeholder="Search Token..."
                onInput={(e: Event) => {
                  state.searchQuery = (e.target as HTMLInputElement).value;
                }}
              />
            </div>
          }
        >
          <RecyclerView
            data={allBalances.value}
            rowHeight={ROW_HEIGHT}
            offsetTop={130}
            class="w-full flex flex-col py-2 min-h-[calc(80vh-130px)]"
            onScroll={() => {
              // reset state.expandedSymbol on scroll
              if (state.expandedSymbol) {
                state.expandedSymbol = "";
              }
            }}
            header={
              <div class="w-full flex justify-start bg-black py-1">
                <div class="relative w-full flex justify-start font-medium text-sm align-text-bottom">
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
            }
            renderItem={RenderItem}
            emptyState={
              <div class="flex-1 p-4 grid place-items-center bg-gray-200 rounded-md text-center mb-1">
                {isLoadingBalances.value ? (
                  <span class="text-lg text-accent-base flex gap-1 items-center">
                    Loading Balances
                    <AssetIcon icon="interactive/anim-racetrack-spinner" />
                  </span>
                ) : state.searchQuery ? (
                  <span class="text-lg text-accent-base">
                    We can't seem to find that token.
                    <br /> Search for another token to continue
                  </span>
                ) : (
                  <span class="text-lg text-accent-base">
                    Please import assets to view balances
                  </span>
                )}
              </div>
            }
          />
        </PageCard>
        <RouterView
          name={!isReady.value ? "DISABLED_WHILE_LOADING" : undefined}
        />
      </Layout>
    );
  },
});

type EnhancedTokenListItem = TokenListItem & {
  isExpanded: boolean;
  isMasked: boolean;
  onExpand(sumbol: string): void;
};

const RenderItem = (item: EnhancedTokenListItem) => (
  <BalanceRow
    key={item.asset.symbol + item.asset.network}
    tokenItem={item}
    isExpanded={item.isExpanded}
    isMasked={item.isMasked}
    onExpand={item.onExpand}
  />
);
