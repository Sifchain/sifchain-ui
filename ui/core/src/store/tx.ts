import { reactive } from "@vue/reactivity";

import { TransactionStatus } from "../entities";
import { InterchainTx } from "../usecases/interchain/_InterchainApi";

export type PendingTransferItem = {
  transactionStatus: TransactionStatus;
  interchainTx: InterchainTx;
};

// Store for reporting on current tx status
export type TxStore = {
  // txs as required by blockchain address
  eth: {
    [address: string]: {
      [hash: string]: TransactionStatus;
    };
  };

  pendingTransfers: {
    [hash: string]: PendingTransferItem;
  };
};

export const tx = reactive<TxStore>({
  eth: {},
  pendingTransfers: {},
}) as TxStore;
