import { useChains, useChainsList } from "@/hooks/useChains";
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
import { PegEvent } from "../../../../core/src/usecases/peg/peg";
import { UnpegEvent } from "../../../../core/src/usecases/peg/unpeg";
import { Vuextra } from "../Vuextra";
import { accountStore } from "./accounts";
import { flagsStore } from "./flags";

export type ExportDraft = {
  amount: string;
  network: Network;
  symbol: string;
  unpegEvent: UnpegEvent | undefined;
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
      const IBC_ETHEREUM_ENABLED =
        flagsStore.state.enableEthereumToCosmosImports;
      const NATIVE_TOKEN_IBC_EXPORTS_ENABLED =
        flagsStore.state.enableNativeTokenIBCExports;
      const asset = Asset(state.draft.symbol);
      const isExternalIBCAsset = ![Network.ETHEREUM, Network.SIFCHAIN].includes(
        asset.homeNetwork,
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
          .filter((n) => {
            if (isExternalIBCAsset && !IBC_ETHEREUM_ENABLED) {
              return n.network !== Network.ETHEREUM;
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
    setUnpegEvent(unpegEvent: UnpegEvent | undefined) {
      state.draft.unpegEvent = unpegEvent;
    },
  }),
  actions: (ctx) => ({
    async runExport(payload: { assetAmount: IAssetAmount }) {
      if (!payload.assetAmount) throw new Error("Please provide an amount");
      self.setUnpegEvent(undefined);

      const interchain = useCore().usecases.interchain(
        useChains().get(Network.SIFCHAIN),
        useChains().get(ctx.state.draft.network),
      );
      const executable = interchain.transfer({
        assetAmount: payload.assetAmount,
        fromAddress: accountStore.state.sifchain.address,
        toAddress: accountStore.state[ctx.state.draft.network].address,
        fromChain: useChains().get(Network.SIFCHAIN),
        toChain: useChains().get(ctx.state.draft.network),
      });

      for await (const ev of executable.generator()) {
        console.log("setUnpegEvent", ev);
        self.setUnpegEvent(ev);
      }

      const chainTx = await executable.awaitResult();
    },
  }),

  modules: [],
});

const self = exportStore;
