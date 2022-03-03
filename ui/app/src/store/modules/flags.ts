import { useChains } from "@/hooks/useChains";
import { Chain, IAsset } from "@sifchain/sdk";

import { Vuextra } from "../Vuextra";

export const isChainFlaggedDisabled = (chain: Chain) => {
  return (
    flagsStore.state.enableTestChains[
      chain?.network as keyof typeof flagsStore.state.enableTestChains
    ] === false
  );
};

export const isAssetFlaggedDisabled = (asset: IAsset) => {
  if (!asset.homeNetwork) return false;
  return isChainFlaggedDisabled(useChains().get(asset.homeNetwork));
};

export const flagsStore = Vuextra.createStore({
  name: "flags",
  options: {
    devtools: true,
  },
  state: {
    ibcTransferTimeoutMinutes: 15,
    rewardClaims: true,
    peggyForCosmosTokens: true,
    ibcForEthTokens: false,
    claimsGraph: false,
    devnetCryptoecon: false,
    tradingCompetitionsEnabled: false,
    allowEmptyLiquidityAdd: false,
    voting: true,
    enableTestChains: {
      band: false,
      likecoin: false,
    },
    balancePageV2: true,
    rewardsCalculator: true,
    manageTokenList: true,
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

      const copyPersistedJsonToState = (json: any, target: any): void => {
        for (const key in json) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          if (typeof target[key] === "object") {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            copyPersistedJsonToState(json[key], target[key]);
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
          } else if (typeof target[key] !== "undefined") {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            target[key] = json[key];
          }
        }
      };
      copyPersistedJsonToState(json, state);
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
