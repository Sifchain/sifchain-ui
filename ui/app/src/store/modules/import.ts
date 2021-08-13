import { useChainsList, useChains } from "@/hooks/useChains";
import { useCore } from "@/hooks/useCore";
import {
  IAsset,
  IAssetAmount,
  Network,
  TransactionStatus,
} from "@sifchain/sdk";
import { PegEvent } from "../../../../core/src/usecases/peg/peg";
import { Vuextra } from "../Vuextra";
import { accountStore } from "./accounts";

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
      return useChainsList().filter((c) => c !== useChains().sifchain);
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
      if (!payload.assetAmount) throw new Error("Please provide an amount");
      self.setPegEvent(undefined);

      const interchain = useCore().usecases.interchain(
        useChains().getByNetwork(payload.assetAmount.network),
        useChains().sifchain,
      );
      const executableTx = await interchain.prepareTransfer(
        payload.assetAmount,
        accountStore.state.ethereum.address,
        accountStore.state.sifchain.address,
      );

      const promise = executableTx.execute();
      for await (const ev of executableTx.generator()) {
        console.log("setPegEvent", ev);
        self.setPegEvent(ev);
      }

      const chainTransferTx = await promise;
      if (chainTransferTx) {
        self.setPegEvent({
          type: "sent",
          tx: {
            state: "requested",
            hash: chainTransferTx.hash,
          },
        });
      }
    },
  }),

  modules: [],
});

const self = importStore;
