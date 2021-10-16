import { useChains } from "@/hooks/useChains";
import { Asset, Chain } from "@sifchain/sdk";
import { Vuextra } from "../Vuextra";

export const isChainFlaggedDisabled = (chain: Chain) => {
  return (
    flagsStore.state.enableTestChains[
      chain?.network as keyof typeof flagsStore.state.enableTestChains
    ] === false
  );
};

export const isAssetFlaggedDisabled = (asset: Asset) => {
  if (!asset.homeNetwork) return false;
  return isChainFlaggedDisabled(useChains().get(asset.homeNetwork));
};

export const flagsStore = Vuextra.createStore({
  name: "flags",
  options: {
    devtools: true,
  },
  state: {
    ibcTransferTimeoutMinutes: 45,
    rewardClaims: true,
    peggyForCosmosTokens: true,
    ibcForEthTokens: true,
    claimsGraph: false,
    devnetCryptoecon: false,
    fieldsOfGoldEnabled: false,
    akashContestEnabled: false,
    dinoContestEnabled: false,
    enableTestChains: {
      band: false,
      osmosis: false,
    },
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
