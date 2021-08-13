import {
  IAssetAmount,
  TransactionStatus,
  IAsset,
  Chain,
  IAmount,
} from "../../entities";
import { UsecaseContext } from "..";
import { SifchainChain } from "../../services/ChainsService";
import { EventEmitter } from "events";
import TypedEmitter, { Arguments } from "typed-emitter";
import { UnpegEvent } from "../peg/unpeg";
import { PegEvent } from "../peg/peg";

export class ChainTransferTransaction {
  constructor(
    public fromChainId: string,
    public toChainId: string,
    public fromAddress: string,
    public toAddress: string,
    public hash: string,
    public assetAmount: IAmount,
  ) {}

  toJSON() {}
  fromJSON() {}
}

export class InterchainApi {
  fromChain: Chain;
  toChain: Chain;
  context: UsecaseContext;

  constructor(context: UsecaseContext, fromChain: Chain, toChain: Chain) {
    this.context = context;
    this.fromChain = fromChain;
    this.toChain = toChain;
  }

  async prepareTransfer(
    assetAmount: IAssetAmount,
    fromAddress: string,
    toAddress: string,
  ): Promise<ExecutableTransaction> {
    throw "not implemented";
  }

  async subscribeToTransfer(
    transferTx: ChainTransferTransaction,
  ): Promise<TransactionStatus> {
    throw "not implemented";
  }
}

export interface ExecutableTransactionEvents {
  approve_started: () => void;
  approve_error: () => void;
  approved: () => void;
  signing: () => void;
  sent: (payload: TransactionStatus) => void;
  tx_error: (payload: TransactionStatus) => void;
}
const executableTransactionEvents: Array<keyof ExecutableTransactionEvents> = [
  "approve_started",
  "approve_error",
  "approved",
  "signing",
  "sent",
  "tx_error",
];

export class ExecutableTransaction extends (EventEmitter as new () => TypedEmitter<ExecutableTransactionEvents>) {
  isComplete = false;
  private promise: Promise<null>;
  private resolve: (v?: any) => void = () => {};
  constructor(
    private fn: (
      executableTx: ExecutableTransaction,
    ) => Promise<ChainTransferTransaction | undefined>,
  ) {
    super();
    this.promise = new Promise((r) => (this.resolve = r));
  }

  emit<E extends keyof ExecutableTransactionEvents>(
    event: E,
    ...args: Arguments<ExecutableTransactionEvents[E]>
  ) {
    console.log("emit", event, ...args);
    return super.emit(event, ...args);
  }

  async execute(): Promise<ChainTransferTransaction | undefined> {
    await new Promise((resolve) => setTimeout(resolve, 1));
    const tx = await this.fn(this);
    this.isComplete = true;
    this.resolve();
    this.removeAllListeners();
    return tx;
  }

  async waitUntilExecuted() {
    return this.promise;
  }

  async *generator(): AsyncGenerator<PegEvent | UnpegEvent> {
    let events: Array<PegEvent> = [];
    let resolve: (v?: any) => void;
    let promise: Promise<any> | undefined = new Promise((r) => (resolve = r));

    executableTransactionEvents.forEach((name) =>
      this.on(name, (tx: any) => {
        events.push({ type: name, tx });
        resolve();
        promise = undefined;
      }),
    );

    while (true) {
      if (events.length) {
        const event = events.shift();
        if (event) yield event;
      } else {
        if (this.isComplete) {
          break;
        } else {
          if (!promise) promise = new Promise((r) => (resolve = r));
          await promise;
        }
      }
    }
  }
}

// export interface TransactionStatusEvents {
//   requested: (tx: TransactionStatus) => void;
//   accepted: (tx: TransactionStatus) => void;
//   failed: (tx: TransactionStatus) => void;
//   rejected: (tx: TransactionStatus) => void;
//   out_of_gas: (tx: TransactionStatus) => void;
//   completed: (tx: TransactionStatus) => void;
// }
// const transactionStatusEvents: Array<keyof TransactionStatusEvents> = [
//   "requested",
//   "accepted",
//   "failed",
//   "rejected",
//   "out_of_gas",
//   "completed",
// ];
// export class InflightTransaction extends (EventEmitter as new () => TypedEmitter<TransactionStatusEvents>) {
//   isComplete = false;

//   constructor(private transactionStatus: TransactionStatus) {
//     super();

//     const complete = () => {
//       this.isComplete = true;
//       this.removeAllListeners();
//     };
//     this.on("failed", complete);
//     this.on("rejected", complete);
//     this.on("out_of_gas", complete);
//     this.on("completed", complete);
//   }

//   update(state: TransactionStatus["state"], data?: Partial<TransactionStatus>) {
//     Object.assign(this.transactionStatus, { ...data, state });
//     this.emit(state, this.transactionStatus);
//   }

//   current() {
//     return this.transactionStatus;
//   }

//   async *generator(): AsyncGenerator<keyof TransactionStatusEvents> {
//     let events: Array<keyof TransactionStatusEvents> = [];
//     let resolve: (v?: any) => void;
//     let promise = new Promise((r) => (resolve = r));

//     transactionStatusEvents.forEach((name) =>
//       this.on(name, () => {
//         events.push(name);
//         resolve();
//       }),
//     );

//     while (true) {
//       if (events.length) {
//         const name = events.shift();
//         if (name) yield name;
//       } else {
//         if (this.isComplete) {
//           break;
//         } else {
//           if (!promise) promise = new Promise((r) => (resolve = r));
//           await promise;
//         }
//       }
//     }
//   }
// }
