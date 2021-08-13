import { UsecaseContext } from "..";
import { IAssetAmount, TransactionStatus, Network } from "../../entities";
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
  cosmoshubChain: CosmoshubChain,
  sifchainChain: SifchainChain,
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
    public fromChain: CosmoshubChain,
    public toChain: SifchainChain,
  ) {}

  async estimateFees(params: InterchainParams) {} // no fees

  transfer(params: InterchainParams) {
    return new ExecutableTransaction<CosmosInterchainTransaction>(
      async (emit) => {
        emit("signing");
        const txSequence = await this.context.services.ibc.transferIBCTokens({
          sourceNetwork: Network.SIFCHAIN,
          destinationNetwork: Network.COSMOSHUB,
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
            emit(
              "tx_error",
              parseTxFailure({
                transactionHash: tx.transactionHash,
                rawLog: tx.rawLog || "",
              }),
            );
          } else {
            emit("sent", {
              state: "completed",
              hash: tx.transactionHash,
              memo: "Transaction Completed",
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
