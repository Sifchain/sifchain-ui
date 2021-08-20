import { useChainsList, useChains } from "@/hooks/useChains";
import { useCore } from "@/hooks/useCore";
import { Asset, IAssetAmount, Network } from "@sifchain/sdk";
import { PegEvent } from "../../../../core/src/usecases/peg/peg";
import { Vuextra } from "../Vuextra";
import { accountStore } from "./accounts";

const NATIVE_TOKEN_IBC_EXPORTS_ENABLED = true;

export type ImportDraft = {
  amount: string;
  network: Network;
  symbol: string;
  pegEvent: PegEvent | undefined;
};

type State = {
  draft: ImportDraft;
  pendingPegEvents: [string, PegEvent][];
};
export const importStore = Vuextra.createStore({
  name: "import",
  options: {
    devtools: true,
  },
  state: {
    draft: {
      amount: "0",
      network: Network.ETHEREUM,
      symbol: "eth",
      pegEvent: undefined,
    },
  } as State,
  getters: (state) => ({
    chains() {
      const asset = Asset(state.draft.symbol);
      return (
        useChainsList()
          .filter((c) => c.network !== Network.SIFCHAIN)
          // Disallow IBC export of ethereum & sifchain-native tokens
          .filter((chain) =>
            NATIVE_TOKEN_IBC_EXPORTS_ENABLED
              ? true
              : [Network.ETHEREUM, Network.SIFCHAIN].includes(asset.homeNetwork)
              ? chain.network === Network.ETHEREUM
              : true,
          )
      );
    },
  }),
  mutations: (state) => ({
    setDraft(nextDraft: Partial<ImportDraft>) {
      if ("network" in nextDraft)
        nextDraft.network = nextDraft.network || Network.ETHEREUM;
      Object.assign(state.draft, nextDraft);
    },
    setPegEvent(pegEvent: PegEvent | undefined) {
      state.draft.pegEvent = pegEvent;
    },
  }),
  actions: (ctx) => ({
    async runImport(payload: { assetAmount: IAssetAmount }) {
      if (!payload.assetAmount) throw new Error("Please provide an amount");
      self.setPegEvent(undefined);

      const interchain = useCore().usecases.interchain(
        useChains().get(ctx.state.draft.network),
        useChains().get(Network.SIFCHAIN),
      );
      const executable = interchain.transfer({
        assetAmount: payload.assetAmount,
        fromAddress: accountStore.state[ctx.state.draft.network].address,
        toAddress: accountStore.state.sifchain.address,
      });

      for await (const ev of executable.generator()) {
        console.log("setPegEvent", ev);
        self.setPegEvent(ev);
      }

      const chainTx = await executable.awaitResult();
    },
  }),

  modules: [],
});

const self = importStore;
