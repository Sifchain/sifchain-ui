import { PropType } from "vue";

import { useCore } from "~/hooks/useCore";
import { PoolStat, usePoolStats } from "~/hooks/usePoolStats";
import { TokenListItem } from "~/hooks/useToken";
import { accountStore } from "~/store/modules/accounts";
import { TokenSortBy } from "~/utils/sortAndFilterTokens";
import { defineComponent } from "@vue/runtime-core";
import { useNativeChain } from "~/hooks/useChains";
import { ReportTransactionError } from "~/business/usecases/utils";
import { governanceStore } from "~/store/modules/governance";

import Modal from "../Modal";
import { Button } from "../Button/Button";
import { PoolsSelector } from "./PoolsSelector";
import { YesNoSelector } from "./YesNoSelector";

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
      currentPoolsVote: [] as string[],
      currentYesNoAnswer: null as null | boolean,
      dropdownOpen: false,
    };
  },
  computed: {
    maxSymbols(): number {
      return this.proposal?.maxBallots || 0;
    },
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
        const aPool = this.poolStatsLookup[a.asset.symbol.toLowerCase()];
        const bPool = this.poolStatsLookup[b.asset.symbol.toLowerCase()];

        return (bPool?.volume ?? 0) - (aPool?.volume ?? 0);
      };
    },
    proposal() {
      const { proposal } = governanceStore.getters.activeProposal;
      return proposal;
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
      const nativeChain = useNativeChain();
      if (!this.proposal) return;

      let memo: string;
      if (this.proposal.voteType === "pools") {
        memo = this.currentPoolsVote
          .map(
            (s) => nativeChain.findAssetWithLikeSymbol(s)?.displaySymbol || s,
          )
          .map((s) => s.toUpperCase())
          .join(",");
      } else {
        memo = this.currentYesNoAnswer ? "YES" : "NO";
      }

      const tx = client.tx.bank.Send(
        {
          fromAddress: accountStore.state.sifchain.address,
          toAddress: this.proposal.address,
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
              message: `Your ${this.proposal.heading} vote has been sent.`,
            },
          });
          governanceStore.updateCurrentVotes(
            governanceStore.getters.currentVotes.concat(this.proposal.id),
          );
          this.onClose();
        }
      } catch (error) {
        reportTransactionError({
          hash: "",
          state: "rejected",
          memo: (error as Error).message || "Request rejected",
        });
      }

      this.signing = false;
    },
  },
  setup() {
    return {
      poolStats: usePoolStats(),
    };
  },
  render() {
    if (!this.proposal) return null;
    return (
      <Modal
        onClose={() => {
          this.onClose();
        }}
        heading={this.proposal.title}
        icon="interactive/ticket"
        showClose={true}
        class="mt-[-300px] w-[70vw] max-w-[700px]"
      >
        <div class="text-left text-lg">{this.proposal.heading}</div>
        <p class="mt-[20px] text-left">
          <div class="whitespace-pre-wrap">{this.proposal.description}</div>
          <a
            href="https://docs.sifchain.network/sifchain/using-the-dex/web-ui-step-by-step/rewards/liquidity-mining-rewards-programs"
            class="text-accent-base cursor-pointer underline"
            target="_blank"
          >
            Learn More
          </a>
        </p>
        <div class="mt-[20px]" />
        {this.proposal.voteType === "pools" ? (
          <PoolsSelector
            class=""
            excludeSymbols={this.proposal.excludedSymbols || ["rowan", "atom"]}
            maxSymbols={this.maxSymbols || 0}
            onChangeSymbols={(symbols: string[]) => {
              this.currentPoolsVote = symbols;
            }}
            symbols={this.currentPoolsVote}
          />
        ) : (
          <YesNoSelector
            value={this.currentYesNoAnswer}
            onChange={(value: Boolean) => {
              this.currentYesNoAnswer = !!value;
            }}
          />
        )}

        {this.proposal.voteType === "pools" &&
          this.currentPoolsVote.length > 0 && (
            <Button.CallToAction
              onClick={() => this.vote()}
              class="mt-[20px]"
              disabled={this.signing || !this.currentPoolsVote.length}
            >
              {!this.currentPoolsVote.length
                ? "No pools selected"
                : this.signing
                ? "Signing..."
                : `Vote for ${this.currentPoolsVote.length} pool${
                    this.currentPoolsVote.length > 1 ? "s" : ""
                  }`}
            </Button.CallToAction>
          )}
        {this.proposal.voteType === "yes_no" && (
          <Button.CallToAction
            onClick={() => this.vote()}
            class="mt-[20px]"
            disabled={this.signing || this.currentYesNoAnswer === null}
          >
            {this.currentYesNoAnswer === null
              ? "Select an answer"
              : this.signing
              ? "Signing..."
              : `Vote ${this.currentYesNoAnswer ? "Yes" : "No"}`}
          </Button.CallToAction>
        )}
      </Modal>
    );
  },
});
