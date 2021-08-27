import { Vuextra } from "../Vuextra";

export const exampleStore = Vuextra.createStore({
  name: "",
  options: {
    devtools: true,
  },
  state: {},
  getters: (state) => ({}),
  actions: (ctx) => ({}),
  mutations: (state) => ({}),
  modules: [],
  async init() {},
});
