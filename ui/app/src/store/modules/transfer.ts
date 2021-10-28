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
import getKeplrProvider from "@sifchain/sdk/src/services/SifService/getKeplrProvider";
import { PegEvent } from "@sifchain/sdk/src/usecases/peg/peg";
import { UnpegEvent } from "@sifchain/sdk/src/usecases/peg/unpeg";
import { Vuextra } from "../Vuextra";
import { accountStore } from "./accounts";
import { flagsStore } from "./flags";

export type TransferDraft = {
  toAddress: string;
  amount: string;
  network: Network;
  symbol: string;
  unpegEvent: UnpegEvent | undefined;
};
type State = {
  draft: TransferDraft;
};
export const transferStore = Vuextra.createStore({
  name: "transfer",
  options: {
    devtools: true,
  },
  state: {
    draft: {
      amount: "0",
      network: Network.SIFCHAIN,
      symbol: "rowan",
      unpegEvent: undefined,
    },
  } as State,
  getters: (state) => ({}),
  mutations: (state) => ({
    setDraft(nextDraft: Partial<TransferDraft>) {
      Object.assign(state.draft, { ...nextDraft, network: Network.SIFCHAIN });
    },
    setUnpegEvent(unpegEvent: UnpegEvent | undefined) {
      state.draft.unpegEvent = unpegEvent;
    },
  }),
  actions: (ctx) => ({
    async runTransfer(payload: {
      toAddress: string;
      fromAddress: string;
      assetAmount: IAssetAmount;
    }) {
      if (!payload.assetAmount) throw new Error("Please provide an amount");
      self.setUnpegEvent(undefined);

      const nativeDexClient = await useCore().services.sif.loadNativeDexClient();

      const tx = nativeDexClient.tx.bank.Send(
        {
          amount: [
            {
              denom:
                payload.assetAmount.asset.ibcDenom ||
                payload.assetAmount.asset.symbol,
              amount: payload.assetAmount.amount.toBigInt().toString(),
            },
          ],
          fromAddress: payload.fromAddress,
          toAddress: payload.toAddress,
        },
        payload.fromAddress,
      );
      const signed = await useCore().services.wallet.keplrProvider.sign(
        useNativeChain(),
        tx,
      );
      const result = await useCore().services.wallet.keplrProvider.broadcast(
        useNativeChain(),
        signed,
      );
      console.log({ result });
      self.setUnpegEvent({
        type: "sent",
        tx: {
          hash: result.transactionHash,
          state: "completed",
        },
      });
    },
  }),

  modules: [],
});

const self = transferStore;
