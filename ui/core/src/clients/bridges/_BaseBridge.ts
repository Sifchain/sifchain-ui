import {
  IAssetAmount,
  TransactionStatus,
  Chain,
  AssetAmount,
  Network,
  WalletConnection,
} from "../../entities";
import { ExecutableEmitter } from "./ExecutableEmitter";
import { EventEmitter } from "events";
import TypedEmitter from "typed-emitter";
import { defer } from "../../utils/defer";
import { Log } from "@cosmjs/stargate/build/logs";
import { WalletProvider } from "../wallets";

export type BridgeApproveStartedEvent = { type: "approve_started" };
export type BridgeApprovedEvent = { type: "approved" };
export type BridgeSentEvent = { type: "sent"; tx: TransactionStatus };
export type BridgeTxError = { type: "tx_error"; tx: TransactionStatus };
export type BridgeApproveError = {
  type: "approve_error";
  tx?: TransactionStatus;
};
export type BridgeSigningEvent = { type: "signing" };
export type BridgeEvent =
  | BridgeApproveStartedEvent
  | BridgeApprovedEvent
  | BridgeSigningEvent
  | BridgeSentEvent
  | BridgeTxError
  | BridgeApproveError;

export type BridgeParams = {
  assetAmount: IAssetAmount;
  fromAddress: string;
  toAddress: string;
  fromChain: Chain;
  toChain: Chain;
};

export interface BaseBridgeTx {
  fromChain: Chain;
  toChain: Chain;
  assetAmount: IAssetAmount;
  fromAddress: string;
  toAddress: string;
  hash: string;
}

export type IBCBridgeTx = BaseBridgeTx & {
  type: "ibc";
  meta?: {
    logs?: Log[];
  };
};

export type EthBridgeTx = BaseBridgeTx & {
  type: "eth";
};

export type BridgeTx = IBCBridgeTx | EthBridgeTx;

export interface BridgeTxEvents {
  tx_sent: (tx: BridgeTx) => void;
  tx_complete: (tx: BridgeTx) => void;
}
export const bridgeTxEmitter = new EventEmitter() as TypedEmitter<BridgeTxEvents>;

export abstract class BaseBridge {
  abstract estimateFees(
    params: BridgeParams,
  ): Promise<IAssetAmount | undefined>;

  abstract transfer(params: BridgeParams): ExecutableTx;

  abstract subscribeToTransfer(
    transferTx: BridgeTx,
  ): AsyncGenerator<TransactionStatus>;
}

export class ExecutableTx extends ExecutableEmitter<BridgeEvent, BridgeTx> {
  execute() {
    this.awaitResult()
      .then((tx: BridgeTx | undefined) => {
        if (tx) interchainTxEmitter.emit("tx_sent", tx);
      })
      .catch((error: Error) => {
        this.emit({
          type: "tx_error",
          tx: {
            state: "failed",
            hash: "",
            memo: error.message,
          },
        });
      });
    super.execute();
  }
}
