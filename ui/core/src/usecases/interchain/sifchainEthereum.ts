import { UsecaseContext } from "..";
import { IAssetAmount, Chain, TransactionStatus } from "../../entities";
import {
  InterchainApi,
  ExecutableTransaction,
  InterchainTransaction,
  InterchainParams,
  CosmosInterchainTransaction,
} from "./_InterchainApi";
import { parseTxFailure } from "../../services/SifService/parseTxFailure";
import { SubscribeToTx } from "../peg/utils/subscribeToTx";
import { SifchainChain, EthereumChain } from "../../services/ChainsService";
import { calculateUnpegFee } from "../peg/utils/calculateExportFee";
import { isOriginallySifchainNativeToken } from "../peg/utils/isOriginallySifchainNativeToken";

export default function createSifchainEthereumApi(
  context: UsecaseContext,
  sifchainChain: SifchainChain,
  ethereumChain: EthereumChain,
) {
  return new SifchainEthereumInterchainApi(
    context,
    sifchainChain,
    ethereumChain,
  );
}

export class SifchainEthereumInterchainApi
  implements InterchainApi<InterchainTransaction> {
  subscribeToTx: ReturnType<typeof SubscribeToTx>;

  constructor(
    public context: UsecaseContext,
    public fromChain: Chain,
    public toChain: Chain,
  ) {
    this.subscribeToTx = SubscribeToTx(context);
  }

  async estimateFees(params: InterchainParams) {
    return calculateUnpegFee(params.assetAmount.asset);
  }

  transfer(params: InterchainParams) {
    return new ExecutableTransaction<InterchainTransaction>(async (emit) => {
      const feeAmount = await this.estimateFees(params);
      emit("signing");

      const lockOrBurnFn = isOriginallySifchainNativeToken(
        params.assetAmount.asset,
      )
        ? this.context.services.ethbridge.lockToEthereum
        : this.context.services.ethbridge.burnToEthereum;

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
        emit(
          "tx_error",
          parseTxFailure({
            transactionHash: txStatus.hash,
            rawLog: txStatus.memo || "",
          }),
        );
      } else {
        emit("sent", txStatus);
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
        fromChainId: this.fromChain.id,
        toChainId: this.toChain.id,
      } as InterchainTransaction;
    });
  }

  async *subscribeToTransfer(
    tx: InterchainTransaction,
  ): AsyncGenerator<TransactionStatus> {
    throw "not implemented";
  }
}
