import { Vuextra } from "../Vuextra";

export const flagsStore = Vuextra.createStore({
  name: "flags",
  options: {
    devtools: true,
  },
  state: {
    ibcTransferTimeoutMinutes: 45,
    rewardClaims: true,
    peggyForCosmosTokens: true,
    ibcForEthTokens: false,
    claimsGraph: false,
    devnetCryptoecon: false,
  },
  getters: (state) => ({}),
  mutations: (state) => ({
    assignSavedState() {
      let json = {};
      try {
        json = JSON.parse(localStorage.getItem("flags") || "") || {};
      } catch (_) {
        json = {} as typeof state;
      }
      for (const key in json) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (state[key] !== undefined) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          state[key] = json[key];
        }
      }
    },
  }),
  actions: (ctx) => ({
    persist: () => {
      localStorage.setItem("flags", JSON.stringify(ctx.state));
    },
  }),
  modules: [],
  init() {
    self.assignSavedState();
  },
});

const self = flagsStore;
