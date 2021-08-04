import { Network } from "@sifchain/sdk";
import { Vuextra } from "../Vuextra";

type ImportDraft = {
  amount: string;
  network: Network;
  displaySymbol: string;
};
type State = {
  draft: ImportDraft;
};
export const importStore = Vuextra.createStore({
  options: {
    devtools: true,
  },
  state: {
    draft: {
      amount: "0",
      network: Network.ETHEREUM,
      displaySymbol: "eth",
    },
  } as State,
  getters: (state) => ({
    networks() {
      return Object.values(Network).filter(
        (network) => network !== Network.SIFCHAIN,
      );
    },
  }),
  actions: (ctx) => ({}),
  mutations: (state) => ({
    setDraft(nextDraft: Partial<ImportDraft>) {
      state.draft = {
        ...state.draft,
        ...nextDraft,
      };
    },
  }),
  modules: [],
});
