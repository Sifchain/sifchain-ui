import { useChains, useChainsList, useNativeChain } from "@/hooks/useChains";
import { useCore } from "@/hooks/useCore";
import {
  AppCookies,
  Asset,
  getEnv,
  getNetworkEnv,
  IAsset,
  IAssetAmount,
  Network,
  NetworkEnv,
} from "@sifchain/sdk";
import { BridgeEvent } from "@sifchain/sdk/src/clients/bridges/BaseBridge";
import { Vuextra } from "../Vuextra";
import { accountStore } from "./accounts";
import { flagsStore } from "./flags";
import { runTransfer } from "./import";

export type ExportDraft = {
  amount: string;
  network: Network;
  symbol: string;
  unpegEvent: BridgeEvent | undefined;
};
type State = {
  draft: ExportDraft;
};
export const exportStore = Vuextra.createStore({
  name: "export",
  options: {
    devtools: true,
  },
  state: {
    draft: {
      amount: "0",
      network: Network.ETHEREUM,
      symbol: "eth",
      unpegEvent: undefined,
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
    setDraft(nextDraft: Partial<ExportDraft>) {
      Object.assign(state.draft, nextDraft);
    },
    setUnpegEvent(unpegEvent: BridgeEvent | undefined) {
      state.draft.unpegEvent = unpegEvent;
    },
  }),
  actions: (ctx) => ({
    async runExport(payload: { assetAmount: IAssetAmount }) {
      if (!payload.assetAmount.amount.greaterThan("0")) return;
      runTransfer(
        {
          fromChain: useNativeChain(),
          fromAddress: accountStore.state.sifchain.address,
          toChain: useChains().get(self.state.draft.network),
          toAddress:
            accountStore.state[self.state.draft.network as Network].address,
          assetAmount: payload.assetAmount,
        },
        self.setUnpegEvent,
      );
    },
  }),

  modules: [],
});

const self = exportStore;
