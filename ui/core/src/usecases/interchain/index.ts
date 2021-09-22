import { UsecaseContext } from "..";
import {
  IAssetAmount,
  Chain,
  Network,
  TransactionStatus,
} from "../../entities";
import {
  EthereumChain,
  SifchainChain,
  CosmoshubChain,
  IrisChain,
  AkashChain,
  SentinelChain,
} from "../../clients/chains";
import InterchainTxManager from "./txManager";
import {
  BridgeTx,
  BridgeParams,
  bridgeTxEmitter,
} from "../../clients/bridges/BaseBridge";

export default function InterchainUsecase(context: UsecaseContext) {
  const ibcBridge = {
    async estimateFees(params: BridgeParams) {
      return context.services.ibc.estimateFees(params);
    },
    transfer(params: BridgeParams) {
      const executable = context.services.ibc.transfer(params);
      executable.awaitResult().then((tx) => {
        if (tx) bridgeTxEmitter.emit("tx_sent", tx);
      });
      executable.execute();
      return executable;
    },
    async *subscribeToTransfer(
      tx: BridgeTx,
    ): AsyncGenerator<TransactionStatus> {
      for await (const ev of context.services.ibc.subscribeToTransfer(tx)) {
        yield ev;
      }
    },
  };

  const ethBridge = {
    async estimateFees(params: BridgeParams) {
      return context.services.ethbridge.estimateFees(params);
    },
    transfer(params: BridgeParams) {
      const executable = context.services.ethbridge.transfer(params);
      executable.awaitResult().then((tx) => {
        if (tx) bridgeTxEmitter.emit("tx_sent", tx);
      });
      executable.execute();
      return executable;
    },
    async *subscribeToTransfer(
      tx: BridgeTx,
    ): AsyncGenerator<TransactionStatus> {
      for await (const ev of context.services.ethbridge.subscribeToTransfer(
        tx,
      )) {
        console.log("ev", ev);
        yield ev;
      }
    },
  };

  const interchain = (from: Chain, to: Chain) => {
    if (from instanceof SifchainChain) {
      if (to.chainConfig.chainType === "ibc") {
        return ibcBridge;
      } else if (to.chainConfig.chainType === "eth") {
        return ethBridge;
      }
    } else if (to instanceof SifchainChain) {
      if (from.chainConfig.chainType === "ibc") {
        return ibcBridge;
      } else if (from.chainConfig.chainType === "eth") {
        return ethBridge;
      }
    }
    throw new Error(
      `Token transfer from chain ${from.network} to chain ${to.network} not supported!`,
    );
  };

  const txManager = InterchainTxManager(context, interchain);
  txManager.listenForSentTransfers();
  txManager.loadSavedTransferList();

  return interchain;
}
