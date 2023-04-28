import { useChains } from "~/hooks/useChains";
import { AppCookies, Chain, IAsset, NetworkEnv } from "@sifchain/sdk";

import { Vuextra } from "../Vuextra";

export const MARGIN_FE_URL = "https://margin.sifchain.network";

export const FLAGS_API_ENDPOINT =
  "https://sifchain-changes-server.vercel.app/api";

export class FlagsApi {
  static async getFlags(
    env: "development" | "staging" | "production" = "production",
  ) {
    try {
      const res = await fetch(`${FLAGS_API_ENDPOINT}/flags/${env}`);
      return res.json() as Promise<Record<string, boolean>>;
    } catch (error) {
      console.log("Failed to fetch flags from server, using defaults instead");
      return {} as Record<string, boolean>;
    }
  }
}

export const isChainFlaggedDisabled = (chain: Chain) => {
  return (
    flagsStore.state.enableTestChains[
      chain?.network as keyof typeof flagsStore.state.enableTestChains
    ] === false
  );
};

const DISABLED_ASSETS: string[] = [];

export const isAssetFlaggedDisabled = (asset: IAsset) => {
  if (!asset.homeNetwork) {
    return false;
  }
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
    liquidityUnlockCancellation: true,
    lppdRewards: true,
    remoteFlags: {
      ASYMMETRIC_POOLING: false,
      MARGIN: false,
      DISABLE_ETH_BRIDGE: false,
      DISABLE_ETH_BRIDGE_EXPORT: false,
      DISABLE_ATOM_POOL: false,
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

      copyPersistedJsonToState(json, state);
    },
    async syncRemoteFlags() {
      const env = AppCookies().getEnv();
      let response: Record<string, boolean>;
      switch (env) {
        case NetworkEnv.STAGING:
        case NetworkEnv.TESTNET:
          response = await FlagsApi.getFlags("staging");
          break;
        case NetworkEnv.DEVNET:
        case NetworkEnv.LOCALNET:
          response = await FlagsApi.getFlags("development");
          break;
        default:
          response = await FlagsApi.getFlags("production");
      }

      const currentFlags = state.remoteFlags as Record<string, boolean>;

      for (const key in response) {
        if (key in currentFlags) {
          if (process.env.NODE_ENV === "development") {
            console.log("Setting flag", key, response[key]);
          }

          currentFlags[key] = Boolean(response[key]);
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
    self.syncRemoteFlags();
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
