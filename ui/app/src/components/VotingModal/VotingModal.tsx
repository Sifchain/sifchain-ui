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
import { ReportTransactionError } from "@/business/usecases/utils";

const POOLS_PROPOSAL = {
  id: "fourpools",
  address: "sif1seftxu8l6v7d50ltm3v7hl55jlyxrps53rmjl8",
  startDateTime: new Date("2021-11-09T01:00:00.000Z"),
  // startDateTime: new Date("2021-11-14T01:00:00.000Z"),
  endDateTime: new Date("2021-11-17T01:00:00.000Z"),
  title: `Sif's Expansion`,
  heading: `Sif's Expansion - Vote for 300% APR`,
  description: `Vote for 4 pools to have ~300% APR for the next 4 weeks. As a reminder, 5 pools in total will have an APR of ~300% for the next four weeks (ATOM:ROWAN and 4 selected by the majority in this vote). All other pools will maintain a 100% APR.  Every 4 weeks, users will execute this vote.`,
};

const hasVoted = ref(
  useCore().services.storage.getJSONItem<boolean>("fourpools"),
);
export const useActiveProposal = () => {
  return computed(() => {
    const hasEnoughRowan = accountStore.state.sifchain.balances.find(
      (b) =>
        b.asset.symbol.toLowerCase() === "rowan" &&
        b.amount.greaterThanOrEqual(toBaseUnits("1", Asset("rowan"))),
    );
    if (
      (hasVoted.value || hasEnoughRowan) &&
      new Date() > POOLS_PROPOSAL.startDateTime &&
      new Date() < POOLS_PROPOSAL.endDateTime &&
      flagsStore.state.voting
    ) {
      return { ...POOLS_PROPOSAL, hasVoted: hasVoted.value };
    }
  });
};

export const VotingModal = defineComponent({
  name: "VotingModal",
  props: {
    onClose: {
      type: Function as PropType<() => void>,
      required: true,
    },
  },
  data() {
    return {
      signing: false,
      maxSymbols: 4,
      votedSymbols: [],
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
            this.poolStatsLookup[b.asset.symbol.toLowerCase()]?.volume || "0",
          ) -
          parseFloat(
            this.poolStatsLookup[a.asset.symbol.toLowerCase()]?.volume || "0",
          )
        );
      };
    },
  },
  methods: {
    async vote() {
      this.signing = true;
      const reportTransactionError = ReportTransactionError(
        useCore().services.bus,
      );

      const keplrProvider = useCore().services.wallet.keplrProvider;
      const client = await useCore().services.sif.loadNativeDexClient();
      const memo = this.votedSymbols
        .map((s) => s.toUpperCase())
        .sort((a, b) => a.localeCompare(b))
        .join(",");
      const tx = client.tx.bank.Send(
        {
          fromAddress: accountStore.state.sifchain.address,
          toAddress: POOLS_PROPOSAL.address,
          amount: [
            {
              denom: "rowan",
              amount: "1",
            },
          ],
        },
        accountStore.state.sifchain.address,
        undefined,
        memo,
      );
      try {
        const signed = await keplrProvider.sign(useNativeChain(), tx);
        const sent = await keplrProvider.broadcast(useNativeChain(), signed);
        const txStatus = keplrProvider.parseTxResultToStatus(sent);
        if (txStatus.state !== "accepted") {
          reportTransactionError(txStatus);
        } else {
          useCore().services.bus.dispatch({
            type: "SuccessEvent",
            payload: {
              message: `Your vote for ${this.votedSymbols
                .map((s) => Asset(s).displaySymbol.toUpperCase())
                .join(", ")} pools has been recorded on-chain.`,
            },
          });
          this.hasVoted = true;
          useCore().services.storage.setJSONItem<Boolean>(
            POOLS_PROPOSAL.id,
            true,
          );
          this.onClose();
        }
      } catch (error) {
        reportTransactionError({
          hash: "",
          state: "rejected",
          memo: error.message || "Request rejected",
        });
      }

      this.signing = false;
    },
  },
  setup() {
    return {
      poolStats: usePoolStats(),
      hasVoted,
    };
  },
  render() {
    return (
      <Modal
        onClose={() => {
          this.onClose();
        }}
        heading={POOLS_PROPOSAL.heading}
        icon="interactive/ticket"
        showClose={true}
        class="max-w-[700px] w-[70vw] mt-[-300px]"
      >
        <p class="text-left">
          {POOLS_PROPOSAL.description}{" "}
          <a
            href="https://docs.sifchain.finance/resources/rewards-programs"
            class="underline cursor-pointer text-accent-base"
            target="_blank"
          >
            Learn More
          </a>
        </p>
        <div class="mt-[20px] relative">
          <section
            active={this.dropdownOpen}
            onClick={() => {
              if (this.votedSymbols.length === this.maxSymbols) return;
              this.dropdownOpen = !this.dropdownOpen;
            }}
            class={[
              "transition-all duration-200 relative py-[8px] px-[10px] pr-0 rounded-[4px] bg-gray-input border-solid border-gray-input_outline border border-solid border-gray-input_outline disabled:bg-transparent text-lg font-medium flex flex-wrap items-center min-h-[60px]",
              this.dropdownOpen && "border-white",
            ]}
          >
            {this.votedSymbols.map((symbol) => {
              return (
                <div
                  key={symbol}
                  tabIndex={-1}
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
                      this.votedSymbols = this.votedSymbols.filter(
                        (s) => s !== symbol,
                      );
                    }}
                  >
                    <AssetIcon icon="interactive/close" size={16} />
                  </button>
                </div>
              );
            })}
            {this.votedSymbols.length < 4 && (
              <div
                class={[
                  "cursor-pointer ml-[6px] h-[36px] flex items-center",
                  this.dropdownOpen && "opacity-50",
                ]}
              >
                Select up to 4 pools...
              </div>
            )}
          </section>
          <TokenSelectDropdown
            sortBy={this.tokenSortBy}
            excludeSymbols={this.votedSymbols.concat("rowan", "uatom")}
            active={this.dropdownOpen}
            hideBalances
            onCloseIntent={() => (this.dropdownOpen = false)}
            onSelectAsset={(asset: IAsset) => {
              if (this.votedSymbols.length < this.maxSymbols) {
                this.votedSymbols.push(asset.symbol.toLowerCase());
              }
              if (this.votedSymbols.length === this.maxSymbols) {
                this.dropdownOpen = false;
              }
            }}
          />
        </div>
        {this.votedSymbols.length > 0 && (
          <Button.CallToAction
            onClick={() => this.vote()}
            class="mt-[20px]"
            disabled={this.signing || !this.votedSymbols.length}
          >
            {!this.votedSymbols.length
              ? "No pools selected"
              : this.signing
              ? "Signing..."
              : `Vote for ${this.votedSymbols.length} pool${
                  this.votedSymbols.length > 1 ? "s" : ""
                }`}
          </Button.CallToAction>
        )}
      </Modal>
    );
  },
});
