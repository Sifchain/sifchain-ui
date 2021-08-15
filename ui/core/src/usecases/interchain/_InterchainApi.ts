import {
  IAssetAmount,
  TransactionStatus,
  Chain,
  AssetAmount,
} from "../../entities";
import { UsecaseContext } from "..";
import { PegEvent } from "../peg/peg";
import { IterableEmitter } from "../../utils/IterableEmitter";
import { defer } from "../../utils/defer";
import { Log } from "@cosmjs/stargate/build/logs";

export type InterchainParams = {
  assetAmount: IAssetAmount;
  fromAddress: string;
  toAddress: string;
};

export type InterchainTransaction = InterchainParams & {
  fromChainId: string;
  toChainId: string;
  hash: string;
};

export type CosmosInterchainTransaction = InterchainTransaction & {
  meta?: {
    logs?: Log[];
  };
};

export abstract class InterchainApi<TxType> {
  abstract fromChain: Chain;
  abstract toChain: Chain;

  abstract estimateFees(
    params: InterchainParams,
  ): Promise<IAssetAmount | undefined | void>;

  abstract transfer(params: InterchainParams): ExecutableTransaction<TxType>;

  abstract subscribeToTransfer(
    transferTx: TxType,
  ): AsyncGenerator<TransactionStatus>;
}

export class IterableTxEmitter<
  EventType,
  ResultTxType
> extends IterableEmitter<EventType> {
  private deferred = defer<ResultTxType | undefined>();

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

export class ExecutableTransaction<ResultTxType> extends IterableTxEmitter<
  PegEvent,
  ResultTxType
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
}
