import { UsecaseContext } from "..";
import {
  IAssetAmount,
  Chain,
  TransactionStatus,
  Network,
} from "../../entities";
import {
  InterchainApi,
  ExecutableTransaction,
  SifchainInterchainTx,
  InterchainParams,
  IBCInterchainTx,
} from "./_InterchainApi";
import { parseTxFailure } from "../../services/SifService/parseTxFailure";
import { SubscribeToTx } from "../peg/utils/subscribeToTx";
import { SifchainChain, EthereumChain } from "../../services/ChainsService";
import { isOriginallySifchainNativeToken } from "../peg/utils/isOriginallySifchainNativeToken";

export class SifchainEthereumInterchainApi
  implements InterchainApi<SifchainInterchainTx> {
  subscribeToTx: ReturnType<typeof SubscribeToTx>;

  constructor(public context: UsecaseContext) {
    this.subscribeToTx = SubscribeToTx(context);
  }

  async estimateFees(params: InterchainParams) {
    return params.toChain.calculateTransferFeeToChain(params.assetAmount);
  }

  transfer(params: InterchainParams) {
    return new ExecutableTransaction(async (emit) => {
      const feeAmount = await this.estimateFees(params);
      emit({ type: "signing" });

      const lockOrBurnFn = (isOriginallySifchainNativeToken(
        params.assetAmount.asset,
      )
        ? this.context.services.ethbridge.lockToEthereum
        : this.context.services.ethbridge.burnToEthereum
      ).bind(this.context.services.ethbridge);

      const tx = await lockOrBurnFn({
        assetAmount: params.assetAmount,
        ethereumRecipient: params.toAddress,
        fromAddress: params.fromAddress,
        feeAmount,
      });

      const txStatus = await this.context.services.sif.signAndBroadcast(
        tx.value.msg,
      );

      if (txStatus.state !== "accepted") {
        this.context.services.bus.dispatch({
          type: "TransactionErrorEvent",
          payload: {
            txStatus,
            message: txStatus.memo || "There was an error while unpegging",
          },
        });
        emit({
          type: "tx_error",
          tx: parseTxFailure({
            transactionHash: txStatus.hash,
            rawLog: txStatus.memo || "",
          }),
        });
      } else {
        emit({ type: "sent", tx: txStatus });
      }

      console.log(
        "unpeg txStatus.state",
        txStatus.state,
        txStatus.memo,
        txStatus.code,
        tx.value.msg,
      );

      return {
        ...params,
        hash: txStatus.hash,
        fromChain: params.fromChain,
        toChain: params.toChain,
      } as SifchainInterchainTx;
    });
  }

  async *subscribeToTransfer(
    tx: SifchainInterchainTx,
  ): AsyncGenerator<TransactionStatus> {
    // We haven't implemented subscribing to exports, so
    // just give one accepted event then abort.
    yield {
      state: "accepted",
      hash: tx.hash,
    };
  }
}
