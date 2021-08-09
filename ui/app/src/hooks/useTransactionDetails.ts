import { computed } from "vue";
import { TransactionStatus } from "@sifchain/sdk";
import { Ref, ComputedRef } from "vue";
import { PegEvent } from "@sifchain/sdk/src/usecases/peg/peg";
import { UnpegEvent } from "../../../core/src/usecases/peg/unpeg";

export function useUnpegEventDetails(props: {
  unpegEvent: Ref<UnpegEvent>;
}): ComputedRef<TransactionDetails> {
  return computed(() => {
    return getUnpegEventDetails(props.unpegEvent.value);
  });
}
export function usePegEventDetails(props: {
  pegEvent: Ref<PegEvent>;
}): ComputedRef<TransactionDetails> {
  return computed(() => {
    return getPegEventDetails(props.pegEvent.value);
  });
}

export function useTransactionDetails(props: {
  tx: Ref<TransactionStatus | null | undefined>;
}): ComputedRef<TransactionDetails> {
  return computed(() => {
    return getTransactionDetails(props.tx.value);
  });
}

export type TransactionDetails = null | {
  tx?: TransactionStatus;
  heading: string;
  description: string;
  isError?: boolean;
  isComplete?: boolean;
};

// For peg transactions, they will transition into using the
// full getTransactionDetails below
export function getPegEventDetails(pegEvent: PegEvent): TransactionDetails {
  const type = pegEvent?.type || null;
  switch (pegEvent?.type) {
    case "sent": {
      return {
        heading: "Transaction Completed",
        description: "Successfully initiated import",
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
        description: "Approve this transaction in your wallet",
      };
    }
    // case 'approved': {} What do with this???
    case "signing": {
      return {
        heading: "Waiting for Confirmation",
        description: "Confirm this transaction in your wallet",
      };
    }
    case "approve_error": {
      return {
        heading: "Transaction Rejected",
        isError: true,
        description: "", // User rejected, say nothing?
      };
    }
    case "tx_error": {
      return getTransactionDetails(pegEvent.tx);
    }
    default: {
      return null;
    }
  }
}

// For peg transactions, they will transition into using the
// full getTransactionDetails below
export function getUnpegEventDetails(pegEvent: UnpegEvent): TransactionDetails {
  const type = pegEvent?.type || null;
  switch (pegEvent?.type) {
    case "sent":
    case "approved": {
      return {
        heading: "Approved",
        description: "Transaction approved",
        isComplete: true,
      };
    }
    case "approve_started": {
      return {
        heading: "Waiting for Approval",
        description: "Approve this transaction in your wallet",
      };
    }
    // case 'approved': {} What do with this???
    case "signing": {
      return {
        heading: "Waiting for Confirmation",
        description: "Confirm this transaction in your wallet",
      };
    }
    case "approve_error": {
      return {
        heading: "Transaction Rejected",
        isError: true,
        description: "", // User rejected, say nothing?
      };
    }
    case "tx_error": {
      return getTransactionDetails(pegEvent.tx);
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
