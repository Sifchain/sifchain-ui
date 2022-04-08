import { DeliverTxResponse, isDeliverTxFailure } from "@cosmjs/stargate";
import { parseTxFailure } from "../../../utils/parseTxFailure";
import { TransactionStatus } from "../../../entities";

export const transactionStatusFromDeliverTxResponse = (
  tx: DeliverTxResponse,
): TransactionStatus => {
  if (isDeliverTxFailure(tx))
    return parseTxFailure({
      transactionHash: tx.transactionHash,
      rawLog: tx.rawLog,
    });

  return {
    code: tx.code,
    hash: tx.transactionHash,
    state: "accepted",
  };
};
