import { useCore } from "@/hooks/useCore";
import { PoolStat, usePoolStats } from "@/hooks/usePoolStats";
import { TokenListItem } from "@/hooks/useToken";
import { accountStore } from "@/store/modules/accounts";
import { flagsStore } from "@/store/modules/flags";
import { TokenSortBy } from "@/utils/sortAndFilterTokens";
import { Asset, IAsset, toBaseUnits } from "@sifchain/sdk";
import { defineComponent } from "@vue/runtime-core";
import { computed, PropType, ref } from "vue";
import AssetIcon from "../AssetIcon";
import { Button } from "../Button/Button";
import Modal from "../Modal";
import { TokenIcon } from "../TokenIcon";
import { TokenSelectDropdown } from "../TokenSelectDropdown";
import { useNativeChain } from "@/hooks/useChains";
import { ReportTransactionError } from "@sifchain/sdk/src/usecases/utils";

export const PoolsSelector = defineComponent({
  name: "PoolsSelector",
  props: {
    onChangeSymbols: {
      type: Function as PropType<(pools: string[]) => void>,
      required: true,
    },
    symbols: {
      type: Array as PropType<string[]>,
      required: true,
    },
    excludeSymbols: {
      type: Array as PropType<string[]>,
      required: true,
    },
    maxSymbols: {
      type: Number,
      default: 4,
    },
    class: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      dropdownOpen: false,
    };
  },
  computed: {
    poolStatsLookup(): Record<string, PoolStat> {
      if (!this.poolStats.data.value) return {};
      const lookup: Record<string, PoolStat> = {};
      this.poolStats.data.value.poolData.pools.forEach((pool) => {
        lookup[pool.symbol.toLowerCase()] = pool;
      });
      return lookup;
    },
    tokenSortBy():
      | TokenSortBy
      | ((a: TokenListItem, b: TokenListItem) => number) {
      if (!this.poolStats.data.value) {
        return "symbol";
      }
      return (a: TokenListItem, b: TokenListItem) => {
        return (
          parseFloat(
            this.poolStatsLookup[b.asset.displaySymbol.toLowerCase()]?.volume ||
              "0",
          ) -
          parseFloat(
            this.poolStatsLookup[a.asset.displaySymbol.toLowerCase()]?.volume ||
              "0",
          )
        );
      };
    },
  },
  setup() {
    return {
      poolStats: usePoolStats(),
    };
  },
  render() {
    return (
      <div class={["relative", this.class]}>
        <section
          active={this.dropdownOpen}
          onClick={() => {
            if (this.symbols.length === this.maxSymbols) return;
            this.dropdownOpen = !this.dropdownOpen;
          }}
          class={[
            "transition-all duration-200 relative py-[8px] px-[10px] pr-0 rounded-[4px] bg-gray-input border-solid border-gray-input_outline border border-solid border-gray-input_outline disabled:bg-transparent text-lg font-medium flex flex-wrap items-center min-h-[60px]",
            this.dropdownOpen && "border-white",
          ]}
        >
          {this.symbols.map((symbol) => {
            return (
              <div
                key={symbol}
                tabIndex={-1}
                onKeyPress={(e) => {
                  if (e.key === "Backspace" || e.key === "Delete") {
                    this.onChangeSymbols(
                      this.symbols.filter((s) => s !== symbol.toLowerCase()),
                    );
                    e.stopPropagation();
                  }
                }}
                onClick={(e) => e.stopPropagation()}
                class="mr-[6px] my-[4px] bg-gray-input_outline p-[5px] px-[7px] rounded-lg flex items-center cursor-none focus:bg-gray-600"
              >
                <TokenIcon
                  assetValue={Asset("rowan")}
                  class="mr-[3px]"
                  size={22}
                />
                <TokenIcon
                  assetValue={Asset(symbol)}
                  class="mr-[6px]"
                  size={22}
                />
                ROWAN / {Asset(symbol).displaySymbol.toUpperCase()}
                <button
                  class="cursor-pointer ml-[4px] opacity-50 py-[4px]"
                  onClick={() => {
                    this.onChangeSymbols(
                      this.symbols.filter((s) => s !== symbol.toLowerCase()),
                    );
                  }}
                >
                  <AssetIcon icon="interactive/close" size={16} />
                </button>
              </div>
            );
          })}
          {this.symbols.length < this.maxSymbols && (
            <div
              onClick={(e) => {
                this.dropdownOpen = true;
                e.stopPropagation();
              }}
              class={[
                "cursor-pointer ml-[6px] h-[36px] flex items-center",
                this.dropdownOpen && "opacity-50",
              ]}
            >
              {!this.symbols.length
                ? `Select ${this.maxSymbols > 1 ? "up to" : ""} ${
                    this.maxSymbols
                  } pool${this.maxSymbols > 1 ? "s" : ""}...`
                : `Select up to ${
                    this.maxSymbols - this.symbols.length
                  } more pools...`}
            </div>
          )}
        </section>
        <TokenSelectDropdown
          sortBy={this.tokenSortBy}
          excludeSymbols={this.symbols.concat(...this.excludeSymbols)}
          active={this.dropdownOpen}
          hideBalances
          onCloseIntent={() => (this.dropdownOpen = false)}
          onSelectAsset={(asset: IAsset) => {
            if (this.symbols.length < this.maxSymbols) {
              this.onChangeSymbols(
                this.symbols.concat(asset.displaySymbol.toLowerCase()),
              );
            }
            if (this.symbols.length === this.maxSymbols) {
              this.dropdownOpen = false;
            }
          }}
        />
      </div>
    );
  },
});
