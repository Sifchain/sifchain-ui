import { useChainsList, useChains } from "@/hooks/useChains";
import { useCore } from "@/hooks/useCore";
import {
  AppCookies,
  Asset,
  getNetworkEnv,
  IAssetAmount,
  Network,
  NetworkEnv,
} from "@sifchain/sdk";
import { PegEvent } from "../../../../core/src/usecases/peg/peg";
import { Vuextra } from "../Vuextra";
import { accountStore } from "./accounts";
import { flagsStore } from "./flags";

export type ImportDraft = {
  amount: string;
  network: Network;
  symbol: string;
  pegEvent: PegEvent | undefined;
};

type State = {
  draft: ImportDraft;
  pendingPegEvents: [string, PegEvent][];
};
export const importStore = Vuextra.createStore({
  name: "import",
  options: {
    devtools: true,
  },
  state: {
    draft: {
      amount: "0",
      network: Network.ETHEREUM,
      symbol: "eth",
      pegEvent: undefined,
    },
  } as State,
  getters: (state) => ({
    chains() {
      const IBC_ETHEREUM_ENABLED = flagsStore.state.peggyForCosmosTokens;
      const NATIVE_TOKEN_IBC_EXPORTS_ENABLED = flagsStore.state.ibcForEthTokens;
      const asset = Asset(state.draft.symbol);
      const isExternalIBCAsset = ![Network.ETHEREUM, Network.SIFCHAIN].includes(
        asset.homeNetwork,
      );
      const isPeggyWhitelistedIBCAsset = useCore()!.config.peggyCompatibleCosmosBaseDenoms.has(
        asset.symbol,
      );
      return (
        useChainsList()
          .filter(
            (c) => c.network !== Network.SIFCHAIN && !c.chainConfig.hidden,
          )
          // Disallow IBC export of ethereum & sifchain-native tokens
          .filter((n) => {
            if (NATIVE_TOKEN_IBC_EXPORTS_ENABLED) {
              // return all tokens when native IBC exports are enabled
              return true;
            } else {
              // if IBC exports are disabled
              if (
                // if it's rowan or an etherem token
                !isExternalIBCAsset
              ) {
                // only show ethereum network
                return n.network === Network.ETHEREUM;
              } else {
                // let them export any IBC token to any IBC network
                return true;
              }
            }
          })
          .filter((c) => {
            if (isExternalIBCAsset && c.network === Network.ETHEREUM) {
              // if it's a peggy-whitelisted IBC token and IBC ethereum is enabled
              return isPeggyWhitelistedIBCAsset && IBC_ETHEREUM_ENABLED;
            }
            return true;
          })
      );
    },
  }),
  mutations: (state) => ({
    setDraft(nextDraft: Partial<ImportDraft>) {
      if ("network" in nextDraft)
        nextDraft.network = nextDraft.network || Network.ETHEREUM;
      Object.assign(state.draft, nextDraft);
    },
    setPegEvent(pegEvent: PegEvent | undefined) {
      state.draft.pegEvent = pegEvent;
    },
  }),
  actions: (ctx) => ({
    async runImport(payload: { assetAmount: IAssetAmount }) {
      if (!payload.assetAmount || !payload.assetAmount.greaterThan("0"))
        throw new Error("Please provide an amount");
      self.setPegEvent(undefined);

      const interchain = useCore().usecases.interchain(
        useChains().get(ctx.state.draft.network),
        useChains().get(Network.SIFCHAIN),
      );
      const executable = interchain.transfer({
        assetAmount: payload.assetAmount,
        fromAddress: accountStore.state[ctx.state.draft.network].address,
        toAddress: accountStore.state.sifchain.address,
        fromChain: useChains().get(ctx.state.draft.network),
        toChain: useChains().get(Network.SIFCHAIN),
      });

      for await (const ev of executable.generator()) {
        self.setPegEvent(ev);
      }
    },
  }),

  modules: [],
});

const self = importStore;
