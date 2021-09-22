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
import Long from "long";
import getKeplrProvider from "../../services/SifService/getKeplrProvider";

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
      const web3 = await this.context.services.ethbridge.loadWeb3();
      const ethereumChainId = await web3.eth.net.getId();
      const client = await this.context.services.sif.loadNativeDexClient();
      const sifAsset = this.context.services.chains
        ?.get(Network.SIFCHAIN)
        .findAssetWithLikeSymbolOrThrow(params.assetAmount.asset.symbol);
      const tx = isOriginallySifchainNativeToken(params.assetAmount.asset)
        ? client.tx.ethbridge.Lock(
            {
              ethereumReceiver: params.toAddress,

              amount: params.assetAmount.toBigInt().toString(),
              symbol:
                params.assetAmount.asset.ibcDenom ||
                params.assetAmount.asset.symbol,
              cosmosSender: params.fromAddress,
              ethereumChainId: Long.fromString(`${ethereumChainId}`),
              // ethereumReceiver: tokenAddress,
              cethAmount: feeAmount.toBigInt().toString(),
            },
            params.fromAddress,
          )
        : client.tx.ethbridge.Burn(
            {
              ethereumReceiver: params.toAddress,

              amount: params.assetAmount.toBigInt().toString(),
              symbol:
                params.assetAmount.asset.ibcDenom ||
                params.assetAmount.asset.symbol,
              cosmosSender: params.fromAddress,
              ethereumChainId: Long.fromString(`${ethereumChainId}`),
              // ethereumReceiver: tokenAddress,
              cethAmount: feeAmount.toBigInt().toString(),
            },
            params.fromAddress,
          );
      const keplr = await getKeplrProvider();
      const signer = await keplr!.getOfflineSigner(
        await this.context.services.sif.unSignedClient.getChainId(),
      );
      const signed = await client.sign(tx, signer);
      const sent = await client.broadcast(signed);
      const txStatus = await client.parseTxResult(sent);
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
        return;
      } else {
        emit({ type: "sent", tx: txStatus });
      }

      console.log(
        "unpeg txStatus.state",
        txStatus.state,
        txStatus.memo,
        txStatus.code,
        tx.msgs[0],
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
