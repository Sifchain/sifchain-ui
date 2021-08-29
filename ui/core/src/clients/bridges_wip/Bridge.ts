import {
  IAssetAmount,
  TransactionStatus,
  Chain,
  AssetAmount,
  Network,
} from "../../entities";
import { UsecaseContext } from "../../usecases";
import { PegEvent } from "../../usecases/peg/peg";
import { IterableEmitter } from "../../utils/IterableEmitter";
import { EventEmitter } from "events";
import TypedEmitter from "typed-emitter";
import { defer } from "../../utils/defer";
import { Log } from "@cosmjs/stargate/build/logs";

export type BridgeParams = {
  assetAmount: IAssetAmount;
  fromAddress: string;
  toAddress: string;
  fromChain: Chain;
  toChain: Chain;
};

export type SifchainBridgeTx = BridgeParams & {
  fromChain: Chain;
  toChain: Chain;
  assetAmount: IAssetAmount;
  fromAddress: string;
  toAddress: string;
  hash: string;
};

export type IBCBridgeTx = SifchainBridgeTx & {
  meta?: {
    logs?: Log[];
  };
};

export type BridgeTx = SifchainBridgeTx | IBCBridgeTx;

export interface BridgeTxEvents {
  tx_sent: (tx: BridgeTx) => void;
  tx_complete: (tx: BridgeTx) => void;
}
export const BridgeTxEmitter = new EventEmitter() as TypedEmitter<BridgeTxEvents>;

export abstract class BaseBridge<TxType> {
  abstract estimateFees(
    params: BridgeParams,
  ): Promise<IAssetAmount | undefined>;

  abstract transfer(params: BridgeParams): ExecutableTransaction;

  abstract subscribeToTransfer(
    transferTx: TxType,
  ): AsyncGenerator<TransactionStatus>;
}

export class IterableTxEmitter<
  EventType,
  ResultTxType
> extends IterableEmitter<EventType> {
  deferred = defer<ResultTxType | undefined>();

  constructor(
    private fn: (
      emit: IterableTxEmitter<EventType, ResultTxType>["emit"],
    ) => Promise<ResultTxType | undefined>,
  ) {
    super();
    this.execute();
  }

  awaitResult() {
    return this.deferred.promise;
  }

  handleError(message?: string) {
    // not implemented
  }

  execute() {
    this.fn(this.emit.bind(this))
      .then((tx) => {
        this.end();
        this.deferred.resolve(tx);
      })
      .catch((error) => {
        console.error(error);
        this.handleError(error?.message || "");
        this.end();
        this.deferred.resolve();
      });
  }
}

// interface ExecutableTxEvent {
//   transfer_sent: (AnyInt
// }
// export const executableTxEmitter = new EventEmitter() as TypedEmitter<ExecutableTxEvent>()

export class ExecutableTransaction extends IterableTxEmitter<
  PegEvent,
  BridgeTx
> {
  handleError(message?: string) {
    this.emit({
      type: "tx_error",
      tx: {
        state: "failed",
        hash: "",
        memo: message,
      },
    });
  }

  execute() {
    super.execute();
    this.deferred.promise.then((tx?: BridgeTx) => {
      if (tx) BridgeTxEmitter.emit("tx_sent", tx);
    });
  }
}
