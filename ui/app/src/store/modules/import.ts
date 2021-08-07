import { useCore } from "@/hooks/useCore";
import { IAsset, IAssetAmount, Network } from "@sifchain/sdk";
import { PegEvent } from "../../../../core/src/usecases/peg/peg";
import { Vuextra } from "../Vuextra";

export type ImportDraft = {
  amount: string;
  network: Network;
  displaySymbol: string;
  pegEvent: PegEvent | undefined;
};
type State = {
  draft: ImportDraft;
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
      displaySymbol: "eth",
      pegEvent: undefined,
    },
  } as State,
  getters: (state) => ({
    networks() {
      return Object.values(Network).filter(
        (network) => network !== Network.SIFCHAIN,
      );
    },
  }),
  mutations: (state) => ({
    setDraft(nextDraft: Partial<ImportDraft>) {
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
      for await (const event of useCore().usecases.peg.peg(
        payload.assetAmount,
        ctx.state.draft.network,
      )) {
        self.setPegEvent(event);
        console.log({ event });
      }
    },
  }),

  modules: [],
});

const self = importStore;
