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
    estimateFees(params: BridgeParams) {
      return context.services.ibc.estimateFees(
        context.services.wallet.keplrProvider,
        params,
      );
    },
    async approveTransfer(params: BridgeParams) {},
    async transfer(params: BridgeParams) {
      const result = await context.services.ibc.transfer(
        context.services.wallet.keplrProvider,
        params,
      );
      bridgeTxEmitter.emit("tx_sent", result);
      return result;
    },
    async awaitTransferCompletion(tx: BridgeTx) {
      return context.services.ibc.awaitTransferCompletion(
        context.services.wallet.keplrProvider,
        tx,
      );
    },
  };

  const ethBridge = {
    estimateFees(params: BridgeParams) {
      return context.services.ethbridge.estimateFees(
        context.services.wallet.metamaskProvider,
        params,
      );
    },
    async approveTransfer(params: BridgeParams) {
      if (params.fromChain.network === Network.ETHEREUM) {
        await context.services.ethbridge.approveTransfer(
          context.services.wallet.metamaskProvider,
          params,
        );
      }
    },
    async transfer(params: BridgeParams) {
      const result = await context.services.ethbridge.transfer(
        params.fromChain.network === Network.SIFCHAIN
          ? context.services.wallet.keplrProvider
          : context.services.wallet.metamaskProvider,
        params,
      );
      bridgeTxEmitter.emit("tx_sent", result);
      return result;
    },
    async awaitTransferCompletion(tx: BridgeTx) {
      return context.services.ethbridge.awaitTransferCompletion(
        context.services.wallet.metamaskProvider,
        tx,
      );
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
