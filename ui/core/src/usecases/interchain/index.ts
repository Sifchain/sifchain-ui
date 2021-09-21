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
import { SifchainCosmosInterchainApi } from "./sifchainCosmosInterchain";
import { EthereumSifchainInterchainApi } from "./ethereumSifchainInterchain";
import { CosmosSifchainInterchainApi } from "./cosmosSifchainInterchain";
import { SifchainEthereumInterchainApi } from "./sifchainEthereumInterchain";
import { BridgeTx, BridgeParams } from "../../clients/bridges/_BaseBridge";
import { interchainTxEmitter } from "./_InterchainApi";

export default function InterchainUsecase(context: UsecaseContext) {
  const sifchainEthereum = new SifchainEthereumInterchainApi(context);
  const ethereumSifchain = new EthereumSifchainInterchainApi(context);

  const ibcBridge = {
    async estimateFees(params: BridgeParams) {
      return context.services.ibc.estimateFees(params);
    },
    transfer(params: BridgeParams) {
      const executable = context.services.ibc.transfer(params);
      executable.awaitResult().then((tx) => {
        if (tx) interchainTxEmitter.emit("tx_sent", tx);
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
      interchainTxEmitter.emit("tx_complete", tx);
    },
  };

  const interchain = (from: Chain, to: Chain) => {
    if (from instanceof SifchainChain) {
      if (to.chainConfig.chainType === "ibc") {
        return ibcBridge;
      } else if (to.chainConfig.chainType === "eth") {
        return sifchainEthereum;
      }
    } else if (to instanceof SifchainChain) {
      if (from.chainConfig.chainType === "ibc") {
        return ibcBridge;
      } else if (from.chainConfig.chainType === "eth") {
        return ethereumSifchain;
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
