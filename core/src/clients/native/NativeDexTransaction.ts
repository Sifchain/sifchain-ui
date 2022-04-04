import { StdTx, BroadcastTxResult } from "@cosmjs/launchpad";
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";

export interface NativeDexTransactionFee {
  gas: string;
  price: {
    denom: string;
    amount: string;
  };
}
export class NativeDexTransaction<EncodeMsg> {
  constructor(
    readonly fromAddress: string,
    readonly msgs: EncodeMsg[],
    readonly fee: NativeDexTransactionFee = {
      gas: "",
      price: {
        denom: "",
        amount: "",
      },
    },
    readonly memo: string = "",
  ) {}
}

export class NativeDexSignedTransaction<T> {
  constructor(
    readonly raw: NativeDexTransaction<T>,
    readonly signed?: StdTx | TxRaw | Uint8Array,
  ) {}
}

export type NativeDexTransactionResult = BroadcastTxResult;
