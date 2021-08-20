import { useChains } from "@/hooks/useChains";
import { useCore } from "@/hooks/useCore";
import { Asset, IAsset, IAssetAmount, Network } from "@sifchain/sdk";
import { PegEvent } from "../../../../core/src/usecases/peg/peg";
import { UnpegEvent } from "../../../../core/src/usecases/peg/unpeg";
import { Vuextra } from "../Vuextra";
import { accountStore } from "./accounts";

const NATIVE_TOKEN_IBC_EXPORTS_ENABLED = false;
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
    networks() {
      const asset = Asset(state.draft.symbol);
      return (
        Object.values(Network)
          .filter((network) => network !== Network.SIFCHAIN)
          // Disallow IBC export of ethereum & sifchain-native tokens
          .filter((n) =>
            NATIVE_TOKEN_IBC_EXPORTS_ENABLED
              ? true
              : [Network.ETHEREUM, Network.SIFCHAIN].includes(asset.homeNetwork)
              ? n === Network.ETHEREUM
              : true,
          )
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
