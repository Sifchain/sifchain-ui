import { UsecaseContext } from "..";
import {
  IAssetAmount,
  Chain,
  TransactionStatus,
  Network,
} from "../../entities";
import {
  BridgeApi,
  ExecutableTransaction,
  SifchainBridgeTx,
  BridgeParams,
} from "./Bridge";
import { SubscribeToTx } from "../peg/utils/subscribeToTx";
import { SifchainChain, EthereumChain } from "../../services/ChainsService";
import { isSupportedEVMChain } from "../utils";
import { isOriginallySifchainNativeToken } from "../peg/utils/isOriginallySifchainNativeToken";
import { createIteratorSubject } from "../../utils/iteratorSubject";

const ETH_CONFIRMATIONS = 50;

export class EthereumSifchainBridgeApi implements BridgeApi<SifchainBridgeTx> {
  subscribeToTx: ReturnType<typeof SubscribeToTx>;

  constructor(public context: UsecaseContext) {
    this.subscribeToTx = SubscribeToTx(context);
  }

  async estimateFees(params: BridgeParams) {
    return params.toChain.calculateTransferFeeToChain(params.assetAmount);
  }

  transfer(params: BridgeParams) {
    return new ExecutableTransaction(async (emit) => {
      if (
        !isSupportedEVMChain(
          this.context.store.wallet.get(Network.ETHEREUM).chainId,
        )
      ) {
        this.context.services.bus.dispatch({
          type: "ErrorEvent",
          payload: {
            message: "EVM Network not supported!",
          },
        });
        emit({
          type: "tx_error",
          tx: {
            state: "failed",
            hash: "",
            memo: "EVM network not supported",
          },
        });
        return;
      }

      if (params.assetAmount.asset.symbol !== "eth") {
        emit({ type: "approve_started" });
        try {
          await this.context.services.ethbridge.approveBridgeBankSpend(
            params.fromAddress,
            params.assetAmount,
          );
        } catch (error) {
          emit({ type: "approve_error" });
          return;
        }
        emit({ type: "approved" });
      }

      emit({ type: "signing" });

      const lockOrBurnFn = (isOriginallySifchainNativeToken(
        params.assetAmount.asset,
      )
        ? this.context.services.ethbridge.burnToSifchain
        : this.context.services.ethbridge.lockToSifchain
      ).bind(this.context.services.ethbridge);

      const pegTx = lockOrBurnFn(
        params.toAddress,
        params.assetAmount,
        ETH_CONFIRMATIONS,
      );
      this.subscribeToTx(pegTx);

      try {
        const hash = await new Promise<string>((resolve, reject) => {
          pegTx.onError((error) => {
            reject(error.payload);
          });
          pegTx.onTxHash((hash) => {
            resolve(hash.txHash);
          });
        });

        emit({ type: "sent", tx: { state: "completed", hash } });

        return {
          ...params,
          fromChain: params.fromChain,
          toChain: params.toChain,
          hash: hash,
        } as SifchainBridgeTx;
      } catch (transactionStatus) {
        emit({ type: "tx_error", tx: transactionStatus });
      }
    });
  }

  async *subscribeToTransfer(transferTx: SifchainBridgeTx) {
    const pegTx = this.context.services.ethbridge.createPegTx(
      ETH_CONFIRMATIONS,
      transferTx.assetAmount.asset.symbol,
      transferTx.hash,
    );
    const { iterator, feed, end } = createIteratorSubject<TransactionStatus>();
    this.subscribeToTx(pegTx, (tx: TransactionStatus) => {
      console.log("feed", tx);
      feed(tx);
      if (tx.state === "completed" || tx.state === "failed") end();
    });
    for await (const ev of iterator) {
      yield ev;
    }
  }
}
