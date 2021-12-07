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

import { PoolsSelector } from "./PoolsSelector";
import { YesNoSelector } from "./YesNoSelector";

type Proposal = {
  id: string;
  address: string;
  startDateTime: Date;
  endDateTime: Date;
  title: string;
  heading: string;
  description: string;
  voteType: "pools" | "yes_no";
};

const PROPOSALS: Proposal[] = [
  {
    id: "4pools_continue_12_21",
    address: "sif1seftxu8l6v7d50ltm3v7hl55jlyxrps53rmjl8",
    startDateTime: new Date("2021-12-01T01:00:00.000Z"),
    endDateTime: new Date("2021-12-31T00:00:00.000Z"),
    title: `Sif's Expansion`,
    heading: `Should Sif's Expansion continue for the next four weeks?`,
    description: `If you would like to continue this rewards program vote Yes.\nIf you would like to stop this rewards program vote No.`,
    voteType: "yes_no",
  },
  {
    id: "4pools_12_21",
    address: "sif1seftxu8l6v7d50ltm3v7hl55jlyxrps53rmjl8",
    startDateTime: new Date("2021-12-07T01:00:00.000Z"),
    endDateTime: new Date("2021-12-31T00:00:00.000Z"),
    title: `Sif's Expansion`,
    heading: `Sif's Expansion Pools - Vote for 300% APR`,
    description: `Vote for 4 pools to have ~300% APR for the next 4 weeks. As a reminder, 5 pools in total will have an APR of ~300% for the next four weeks (ATOM:ROWAN and 4 selected by the majority in this vote). All other pools will maintain a 100% APR.  Every 4 weeks, users will execute this vote.`,
    voteType: "pools",
  },
];

const currentVotes = ref(
  useCore().services.storage.getJSONItem<string[]>("votes") ?? [],
);

const updateCurrentVotes = (value: string[]) => {
  // Remove duplicates
  value = [...new Set([...value])];

  currentVotes.value = value;
  useCore().services.storage.setJSONItem<string[]>("votes", value);
};

export const markVoted = (proposalId: string) => {
  currentVotes.value.push(proposalId);
};

export const useActiveProposal = () => {
  return computed(() => {
    const hasEnoughRowan = accountStore.state.sifchain.balances.find(
      (b) =>
        b.asset.symbol.toLowerCase() === "rowan" &&
        b.amount.greaterThanOrEqual(toBaseUnits("1", Asset("rowan"))),
    );
    const activeProposal = PROPOSALS.filter((p) => {
      return p.startDateTime < new Date() && new Date() < p.endDateTime;
    })[0];

    if (flagsStore.state.voting && hasEnoughRowan && activeProposal) {
      return {
        proposal: activeProposal,
        hasVoted: currentVotes.value.includes(activeProposal.id),
      };
    }
    return {
      proposal: null,
      hasVoted: false,
    };
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
      currentPoolsVote: [] as string[],
      currentYesNoAnswer: null as null | boolean,
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
    proposal(): Proposal | null {
      const { proposal } = useActiveProposal().value;
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

      if (!this.proposal) return;

      let memo: string;
      if (this.proposal.voteType === "pools") {
        memo = this.currentPoolsVote
          .map((s) => s.toUpperCase())
          .sort((a, b) => a.localeCompare(b))
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
              message: `Your ${this.proposal.title} vote has been sent.`,
            },
          });

          updateCurrentVotes(currentVotes.value.concat(this.proposal.id));
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
        class="max-w-[700px] w-[70vw] mt-[-300px]"
      >
        <div className="text-lg text-left">{this.proposal.heading}</div>
        <p class="text-left mt-[20px]">
          <div class="whitespace-pre-wrap">{this.proposal.description}</div>
          <a
            href="https://docs.sifchain.finance/resources/rewards-programs"
            class="underline cursor-pointer text-accent-base"
            target="_blank"
          >
            Learn More
          </a>
        </p>
        <div class="mt-[20px]" />
        {this.proposal.voteType === "pools" ? (
          <PoolsSelector
            onChangeSymbols={(symbols: string[]) => {
              this.currentPoolsVote = symbols;
            }}
            symbols={this.currentPoolsVote}
          />
        ) : (
          <YesNoSelector
            value={this.currentYesNoAnswer}
            onChange={(value: boolean) => {
              this.currentYesNoAnswer = value;
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
