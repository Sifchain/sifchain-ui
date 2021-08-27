import { UsecaseContext } from "..";
import {
  IAssetAmount,
  TransactionStatus,
  Network,
  Chain,
} from "../../entities";
import {
  InterchainApi,
  ExecutableTransaction,
  SifchainInterchainTx,
  InterchainParams,
  IBCInterchainTx,
} from "./_InterchainApi";
import { SifchainChain, CosmoshubChain } from "../../services/ChainsService";
import { isBroadcastTxFailure } from "@cosmjs/stargate";
import { findAttribute, parseRawLog, Log } from "@cosmjs/stargate/build/logs";
import { createIteratorSubject } from "../../utils/iteratorSubject";

import { IBCTransferSubscriber } from "./utils";

export default function createCosmoshubSifchainApi(context: UsecaseContext) {
  return new CosmoshubSifchainInterchainApi(
    context,
    context.services.chains.get(Network.COSMOSHUB),
    context.services.chains.get(Network.SIFCHAIN),
  );
}

export class CosmoshubSifchainInterchainApi
  implements InterchainApi<IBCInterchainTx> {
  subscriber = IBCTransferSubscriber(this.context);
  constructor(
    public context: UsecaseContext,
    public fromChain: Chain,
    public toChain: Chain,
  ) {}

  async estimateFees(params: InterchainParams) {} // no fees

  transfer(params: InterchainParams) {
    console.log("transfer", this.fromChain, this.toChain);
    return new ExecutableTransaction(async (emit) => {
      emit({ type: "signing" });
      try {
        const txSequence = await this.context.services.ibc.transferIBCTokens({
          sourceNetwork: this.fromChain.network,
          destinationNetwork: this.toChain.network,
          assetAmountToTransfer: params.assetAmount,
        });
        for (let tx of txSequence) {
          if (isBroadcastTxFailure(tx)) {
            this.context.services.bus.dispatch({
              type: "ErrorEvent",
              payload: {
                message: "IBC Transfer Failed",
              },
            });
            emit({
              type: "tx_error",
              tx: {
                state: tx.rawLog?.includes("out of gas")
                  ? "out_of_gas"
                  : "failed",
                memo: tx.rawLog || "",
                hash: tx.transactionHash,
              },
            });
            return;
          } else {
            const logs = parseRawLog(tx.rawLog);
            emit({
              type: "sent",
              tx: { state: "completed", hash: tx.transactionHash },
            });

            return {
              ...params,
              fromChain: this.fromChain,
              toChain: this.toChain,
              hash: tx.transactionHash,
              meta: { logs },
            } as IBCInterchainTx;
          }
        }
      } catch (err) {
        // "signing_error"?
        console.error(err);
        emit({ type: "approve_error" });
        return;
      }
    });
  }

  async *subscribeToTransfer(
    tx: IBCInterchainTx,
  ): AsyncGenerator<TransactionStatus> {
    for await (const ev of this.subscriber.subscribe(tx)) {
      yield ev;
    }
  }
}
