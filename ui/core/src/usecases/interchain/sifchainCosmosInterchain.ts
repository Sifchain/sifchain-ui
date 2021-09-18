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
import { parseTxFailure } from "../../services/SifService/parseTxFailure";
import { SifchainChain, CosmoshubChain } from "../../services/ChainsService";
import { isBroadcastTxFailure } from "@cosmjs/launchpad";
import { findAttribute, parseRawLog } from "@cosmjs/stargate/build/logs";
import { IBCTransferSubscriber } from "./utils";

export class SifchainCosmosInterchainApi
  implements InterchainApi<IBCInterchainTx> {
  subscriber = IBCTransferSubscriber(this.context);
  constructor(public context: UsecaseContext) {}

  async estimateFees(params: InterchainParams) {
    return params.toChain.calculateTransferFeeToChain(params.assetAmount);
  }

  transfer(params: InterchainParams) {
    return new ExecutableTransaction(async (emit) => {
      emit({ type: "signing" });
      const txSequence = await this.context.services.ibc.transferIBCTokens({
        sourceNetwork: params.fromChain.network,
        destinationNetwork: params.toChain.network,
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
            tx: parseTxFailure({
              transactionHash: tx.transactionHash,
              rawLog: tx.rawLog || "",
            }),
          });
        } else {
          emit({
            type: "sent",
            tx: {
              state: "completed",
              hash: tx.transactionHash,
              memo: "Transaction Completed",
            },
          });
          return {
            ...params,
            hash: tx.transactionHash,
            fromChain: params.fromChain,
            toChain: params.toChain,
            meta: {
              logs: parseRawLog(tx.rawLog),
            },
          } as IBCInterchainTx;
        }
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
