import { defineComponent } from "@vue/runtime-core";
import { Vuextra } from "../Vuextra";

export type FlagsState = {
  ibcTransferTimeoutMinutes: number;
  enableRewardsClaim: boolean;
};

let json: any = {};
try {
  json = JSON.parse(localStorage.getItem("flags") || "") || {};
} catch (_) {}

export const flagsStore = Vuextra.createStore({
  name: "flags",
  options: {
    devtools: true,
  },
  state: {
    ibcTransferTimeoutMinutes: json?.ibcTransferTimeoutMinutes || 45,
    enableRewardsClaim: json?.enableRewardsClaim || false,
  } as FlagsState,
  getters: (state) => ({}),
  mutations: (state) => ({}),
  actions: (ctx) => ({
    persist: () => {
      localStorage.setItem("flags", JSON.stringify(ctx.state));
    },
  }),
  modules: [],
});

const self = flagsStore;
