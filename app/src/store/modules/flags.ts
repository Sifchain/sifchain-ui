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

const DISABLED_ASSETS: string[] = [];

export const isAssetFlaggedDisabled = (asset: IAsset) => {
  if (!asset.homeNetwork) return false;
  if (DISABLED_ASSETS.includes(asset.symbol.toLowerCase())) {
    return false;
  }
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
      // terra: false,
      // likecoin: false,
    },
    balancePageV2: true,
    rewardsCalculator: false,
    pmtp: true,
    newLiquidityUnlockProcess: true,
    liquidityUnlockCancellation: false,
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

function copyPersistedJsonToState(
  json: Record<string, any>,
  target: Record<string, any>,
) {
  for (const key in json) {
    if (typeof target[key] === "object") {
      copyPersistedJsonToState(json[key], target[key]);
    } else if (typeof target[key] !== "undefined") {
      target[key] = json[key];
    }
  }
}
