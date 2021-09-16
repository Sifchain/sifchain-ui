import { StdTx } from "@cosmjs/launchpad";
import { EncodeObject } from "@cosmjs/proto-signing";
import { IAssetAmount } from "../../../entities";

export interface NativeDexTransactionFee {
  gas: string;
  price: {
    denom: string;
    amount: string;
  };
}
export class NativeDexTransaction<EncodeMsg extends Readonly<EncodeObject>> {
  constructor(
    readonly fromAddress: string,
    readonly msgs: EncodeMsg[],
    readonly fee: NativeDexTransactionFee,
    readonly memo: string = "",
  ) {}
}

export class NativeDexSignedTransaction<T extends EncodeObject> {
  constructor(readonly raw: NativeDexTransaction<T>, readonly signed: StdTx) {}
}
