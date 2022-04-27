import {
  DeliverTxResponse,
  TransactionStatus,
  transactionStatusFromDeliverTxResponse,
} from "@sifchain/sdk";
import { BridgeEvent } from "@sifchain/sdk/src/clients/bridges/BaseBridge";
import { computed, ComputedRef, Ref, unref } from "vue";
import { MaybeRef } from "vue-query/lib/vue/types";

export function useBridgeEventDetails(props: {
  bridgeEvent: Ref<BridgeEvent>;
}): ComputedRef<TransactionDetails> {
  return computed(() => {
    return getBridgeEventDetails(props.bridgeEvent.value);
  });
}

export function useTransactionDetails(props: {
  tx: Ref<TransactionStatus | null | undefined>;
}): ComputedRef<TransactionDetails> {
  return computed(() => {
    return getTransactionDetails(props.tx.value);
  });
}

export const useDeliverTxDetails = (
  tx: MaybeRef<DeliverTxResponse | undefined>,
  isLoading: MaybeRef<boolean>,
  isQueryError: MaybeRef<boolean>,
) =>
  computed(() => {
    const unrefTx = unref(tx);
    if (unrefTx === undefined && unref(isQueryError) === true) {
      return getTransactionDetails({
        hash: "",
        state: "failed",
      });
    }

    if (unref(isLoading)) {
      return {
        heading: "Waiting for Confirmation",
        description: "Confirm this transaction in your wallet",
      };
    }

    return getTransactionDetails(
      unrefTx === undefined
        ? undefined
        : transactionStatusFromDeliverTxResponse(unrefTx),
    );
  });

export type TransactionDetails = null | {
  tx?: TransactionStatus;
  heading: string;
  description: string;
  isError?: boolean;
  isComplete?: boolean;
};

// For peg transactions, they will transition into using the
// full getTransactionDetails below
export function getBridgeEventDetails(
  bridgeEvent: BridgeEvent,
): TransactionDetails {
  switch (bridgeEvent?.type) {
    case "sent": {
      return {
        heading: "Transaction Completed",
        description: "Successfully initiated transfer",
        isComplete: true,
      };
    }
    case "approved": {
      return {
        heading: "Approved",
        description: "Transaction approved",
      };
    }
    case "approve_started": {
      return {
        heading: "Waiting for Approval",
        description:
          "Approving spend (this may take a few minutes to confirm on-chain...)",
      };
    }
    // case 'approved': {} What do with this???
    case "signing": {
      return {
        heading: "Waiting for Confirmation",
        description: "Confirm the transaction in your wallet...",
      };
    }
    case "approve_error": {
      return {
        heading: "Transaction Rejected",
        isError: true,
        description: bridgeEvent.tx?.memo || "",
      };
    }
    case "tx_error": {
      return getTransactionDetails(bridgeEvent.tx);
    }
    default: {
      return null;
    }
  }
}

// For any old transaction
export function getTransactionDetails(
  tx: TransactionStatus | null | undefined,
): TransactionDetails {
  const payload = {
    tx,
  };
  const state = tx?.state || null;
  Object.assign(
    payload,
    (() => {
      switch (state) {
        case "requested": {
          return {
            heading: "Waiting for Confirmation",
            description: "Confirm this transaction in your wallet",
          };
        }
        case "accepted":
        case "completed": {
          return {
            heading: "Transaction Submitted",
            description: "",
          };
        }
        case "out_of_gas": {
          return {
            isError: true,
            heading: "Transaction Failed - Out of Gas",
            description: "Please try to increase the gas limit.",
          };
        }
        case "rejected": {
          return {
            isError: true,
            heading: "Transaction Rejected",
            description: tx?.memo || "",
          };
        }
        case "failed": {
          return {
            isError: true,
            heading: "Transaction Failed",
            description: tx?.memo || "",
          };
        }
        default:
          return null;
      }
    })(),
  );

  return payload as TransactionDetails;
}
