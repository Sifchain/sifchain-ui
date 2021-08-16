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
  InterchainTransaction,
  InterchainParams,
  CosmosInterchainTransaction,
} from "./_InterchainApi";
import { parseTxFailure } from "../../services/SifService/parseTxFailure";
import { SifchainChain, CosmoshubChain } from "../../services/ChainsService";
import { isBroadcastTxFailure } from "@cosmjs/stargate";
import { findAttribute, parseRawLog } from "@cosmjs/stargate/build/logs";

export default function createCosmoshubSifchainApi(
  context: UsecaseContext,
  cosmoshubChain: Chain,
  sifchainChain: Chain,
) {
  return new SifchainCosmoshubInterchainApi(
    context,
    cosmoshubChain,
    sifchainChain,
  );
}

export class SifchainCosmoshubInterchainApi
  implements InterchainApi<CosmosInterchainTransaction> {
  constructor(
    public context: UsecaseContext,
    public fromChain: Chain,
    public toChain: Chain,
  ) {}

  async estimateFees(params: InterchainParams) {} // no fees

  transfer(params: InterchainParams) {
    return new ExecutableTransaction<CosmosInterchainTransaction>(
      async (emit) => {
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
              fromChainId: this.fromChain.id,
              toChainId: this.toChain.id,
              meta: {
                logs: parseRawLog(tx.rawLog),
              },
            } as CosmosInterchainTransaction;
          }
        }
      },
    );
  }

  async *subscribeToTransfer(
    tx: CosmosInterchainTransaction,
  ): AsyncGenerator<TransactionStatus> {
    throw "not implemented";
  }
}
