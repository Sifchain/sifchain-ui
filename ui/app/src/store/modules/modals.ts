import { Vuextra } from "../Vuextra";

export const modalsStore = Vuextra.createStore({
  name: "modals",
  options: {
    devtools: true,
  },
  state: {
    keplrTutorial: false,
  },
  getters: (state) => ({}),
  mutations: (state) => ({
    setKeplrTutorial(isOpen: boolean) {
      state.keplrTutorial = isOpen;
    },
  }),
  actions: (ctx) => ({}),
  modules: [],
  init() {},
});

const self = modalsStore;
