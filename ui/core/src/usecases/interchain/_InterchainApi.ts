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

export interface InterchainApi<TxType> {
  fromChain: Chain;
  toChain: Chain;

  estimateFees(
    params: InterchainParams,
  ): Promise<IAssetAmount | undefined | void>;

  transfer(params: InterchainParams): ExecutableTransaction<TxType>;

  subscribeToTransfer(transferTx: TxType): AsyncGenerator<TransactionStatus>;
}

export class ExecutableTransaction<TxType> extends IterableEmitter<
  PegEvent["type"],
  TransactionStatus | undefined
> {
  private deferred = defer<TxType | undefined>();

  constructor(
    private fn: (
      emit: ExecutableTransaction<TxType>["emit"],
    ) => Promise<TxType | undefined>,
  ) {
    super();
    this.execute();
  }

  awaitResult() {
    return this.deferred.promise;
  }

  private execute() {
    this.fn(this.emit)
      .then((tx) => {
        this.completeExecution();
        this.deferred.resolve(tx);
      })
      .catch((error) => {
        console.error(error);
        this.emit("tx_error", {
          state: "failed",
          hash: "",
          memo: error.message,
        });
        this.completeExecution();
        this.deferred.resolve();
      });
  }

  async *generator(): AsyncGenerator<PegEvent> {
    for await (const ev of this.subject.iterator) {
      yield {
        type: ev.type,
        tx: ev.payload,
      } as PegEvent;
    }
  }
}
