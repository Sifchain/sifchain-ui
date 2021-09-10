import { AppCookies, NetworkEnv } from "@sifchain/sdk";
import { defineComponent } from "@vue/runtime-core";
import { Vuextra } from "../Vuextra";

export const flagsStore = Vuextra.createStore({
  name: "flags",
  options: {
    devtools: true,
  },
  state: {
    ibcTransferTimeoutMinutes: 45,
    rewardClaims: true,
    claimsGraph: false,
    peggyForCosmosTokens: true,
    ibcForEthTokens: AppCookies().getEnv() === NetworkEnv.TESTNET_042_IBC,
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
