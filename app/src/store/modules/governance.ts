import { watch } from "vue";
import { Asset, toBaseUnits } from "@sifchain/sdk";

import { useCore } from "~/hooks/useCore";
import { accountStore } from "~/store/modules/accounts";
import { flagsStore } from "~/store/modules/flags";

import { Vuextra } from "../Vuextra";

const getVotesKey = () => {
  if (!accountStore.state.sifchain.address) {
    return null;
  }
  return `votes_${accountStore.state.sifchain.address}`;
};

type Proposal = {
  id: string;
  address: string;
  startDateTime: Date;
  endDateTime: Date;
  title: string;
  heading: string;
  description: string;
  voteType: "pools" | "yes_no";
  maxBallots: number;
  excludedSymbols?: string[];
};

const proposals: Proposal[] = [
  {
    id: "4pools_continue_12_21",
    address: "sif1seftxu8l6v7d50ltm3v7hl55jlyxrps53rmjl8",
    startDateTime: new Date("2021-12-01T01:00:00.000Z"),
    endDateTime: new Date("2021-12-31T00:00:00.000Z"),
    title: `Sif's Expansion`,
    heading: `Should Sif's Expansion continue for the next four weeks?`,
    description: `If you would like to continue this rewards program vote Yes.\nIf you would like to stop this rewards program vote No.`,
    voteType: "yes_no",
    maxBallots: 1,
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
    maxBallots: 4,
  },
  {
    id: "4pools_01_29_22",
    address: "sif1seftxu8l6v7d50ltm3v7hl55jlyxrps53rmjl8",
    startDateTime: new Date(1643472000000),
    // startDateTime: new Date(Date.now() - 100000000),
    endDateTime: new Date(1643472000000 + 72 * 60 * 60 * 1000),
    heading: `Sif's Expansion Stablecoin Bonus`,
    title: `Stablecoin Vote`,
    description: `Polls are now open for the Pools of the People v4 - Stable Coin Vote. The voting period will end on 2/1 at 8am PST. Please select 1 stablecoin pool.`,
    voteType: "pools",
    maxBallots: 1,
    excludedSymbols: ["rowan", "uatom", "ceth", "cust"],
  },
  {
    // block height @ Feb 3, 2022 @ 3:06pm MST: 5399148
    id: "4pools_02_03_22",
    address: "sif1seftxu8l6v7d50ltm3v7hl55jlyxrps53rmjl8",
    // startDateTime: new Date(1643472000000),
    startDateTime: new Date(1643925932698),
    endDateTime: new Date(1644350400000),
    heading: `Sif's Expansion Bonus (v4)`,
    title: `! Bonus Revote`,
    description: `Polls are reopened for the Pools of the People v4 - Bonus Coin Vote. An issue was discovered that caused selections to be sorted alphabetically, misaligning the rank weights. The voting period will extend until 2/8 at 12pm PST. Please select 4 bonus coin pools, in order of preference.`,
    voteType: "pools",
    maxBallots: 4,
    excludedSymbols: ["rowan", "uatom", "ceth", "cusdc"],
    // use display symbols instead of denoms
    // add home network in future (consider omnievm)
    // change address to deprecate old voting method (manual)
  },
];

export const governanceStore = Vuextra.createStore({
  name: "governance",
  options: {
    devtools: true,
  },
  state: {
    proposals,
    currentVotesInMemory: [] as string[],
  },
  getters: (state) => ({
    currentVotes() {
      return state.currentVotesInMemory;
    },
    activeProposal() {
      const hasEnoughRowan = accountStore.state.sifchain.balances.find(
        (b) =>
          b.asset.symbol.toLowerCase() === "rowan" &&
          b.amount.greaterThanOrEqual(toBaseUnits("1", Asset("rowan"))),
      );
      const activeProposal = proposals.filter((p) => {
        return p.startDateTime < new Date() && new Date() < p.endDateTime;
      })[0];

      const hasVoted: boolean = state.currentVotesInMemory.includes(
        activeProposal?.id,
      );
      const shouldShow = hasVoted || hasEnoughRowan;

      if (
        shouldShow &&
        accountStore.state.sifchain.address &&
        flagsStore.state.voting &&
        activeProposal
      ) {
        return {
          proposal: activeProposal,
          hasVoted,
        };
      }
      return {
        proposal: null,
        hasVoted,
      };
    },
  }),
  actions: (ctx) => ({}),
  mutations: (state) => ({
    updateCurrentVotes(value: string[]) {
      const key = getVotesKey();
      if (!key) throw new Error("Need to be connected to update votes");
      // Remove duplicates
      value = [...new Set([...value])];
      useCore().services.storage.setJSONItem<string[]>(key, value);
      state.currentVotesInMemory = value;
    },
  }),
  modules: [],
  async init() {
    watch(
      [accountStore.state.sifchain],
      () => {
        const key = getVotesKey();
        if (!key) return;
        self.updateCurrentVotes(
          useCore().services.storage.getJSONItem<string[]>(key) || [],
        );
      },
      { deep: true },
    );
  },
});

const self = governanceStore;
