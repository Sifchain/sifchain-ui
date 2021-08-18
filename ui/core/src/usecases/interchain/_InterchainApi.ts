import {
  IAssetAmount,
  TransactionStatus,
  Chain,
  AssetAmount,
  Network,
} from "../../entities";
import { UsecaseContext } from "..";
import { PegEvent } from "../peg/peg";
import { IterableEmitter } from "../../utils/IterableEmitter";
import { EventEmitter } from "events";
import TypedEmitter from "typed-emitter";
import { defer } from "../../utils/defer";
import { Log } from "@cosmjs/stargate/build/logs";

export type InterchainParams = {
  assetAmount: IAssetAmount;
  fromAddress: string;
  toAddress: string;
};

export type SifchainInterchainTx = InterchainParams & {
  fromChain: Chain;
  toChain: Chain;
  assetAmount: IAssetAmount;
  fromAddress: string;
  toAddress: string;
  hash: string;
};

export type IBCInterchainTx = SifchainInterchainTx & {
  meta?: {
    logs?: Log[];
  };
};

export type InterchainTx = SifchainInterchainTx | IBCInterchainTx;

export interface InterchainTxEvents {
  tx_sent: (tx: InterchainTx) => void;
}
export const interchainTxEmitter = new EventEmitter() as TypedEmitter<InterchainTxEvents>;

export abstract class InterchainApi<TxType> {
  abstract fromChain: Chain;
  abstract toChain: Chain;

  abstract estimateFees(
    params: InterchainParams,
  ): Promise<IAssetAmount | undefined | void>;

  abstract transfer(params: InterchainParams): ExecutableTransaction;

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
  InterchainTx
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
    this.deferred.promise.then((tx?: InterchainTx) => {
      if (tx) interchainTxEmitter.emit("tx_sent", tx);
    });
  }
}
