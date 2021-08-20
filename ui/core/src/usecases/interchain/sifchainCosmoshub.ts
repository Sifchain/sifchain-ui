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
import { isBroadcastTxFailure } from "@cosmjs/stargate";
import { findAttribute, parseRawLog } from "@cosmjs/stargate/build/logs";

export default function createCosmoshubSifchainApi(context: UsecaseContext) {
  return new SifchainCosmoshubInterchainApi(
    context,
    context.services.chains.get(Network.SIFCHAIN),
    context.services.chains.get(Network.COSMOSHUB),
  );
}

export class SifchainCosmoshubInterchainApi
  implements InterchainApi<IBCInterchainTx> {
  constructor(
    public context: UsecaseContext,
    public fromChain: Chain,
    public toChain: Chain,
  ) {}

  async estimateFees(params: InterchainParams) {} // no fees

  transfer(params: InterchainParams) {
    return new ExecutableTransaction(async (emit) => {
      emit({ type: "signing" });
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
            fromChain: this.fromChain,
            toChain: this.toChain,
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
    // We haven't implemented subscribing to exports, so
    // just give one accepted event then abort.
    yield {
      state: "accepted",
      hash: tx.hash,
    };
  }
}
