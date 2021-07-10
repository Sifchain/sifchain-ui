import { computed } from "vue";
import { AppConfig, TransactionStatus } from "@sifchain/sdk";
import { Ref, ComputedRef } from "vue";
import { PegEvent } from "@sifchain/sdk/src/usecases/peg/peg";
import { getBlockExplorerUrl } from "@/componentsLegacy/shared/utils";

export function usePegEventDetails(props: {
  config: AppConfig;
  pegEvent: Ref<PegEvent>;
}): ComputedRef<TransactionDetails> {
  return computed(() => {
    return getPegEventDetails(props.config, props.pegEvent.value);
  });
}

export function useTransactionDetails(props: {
  config: AppConfig;
  tx: Ref<TransactionStatus>;
}): ComputedRef<TransactionDetails> {
  return computed(() => {
    return getTransactionDetails(props.config, props.tx.value);
  });
}

export type TransactionDetails = null | {
  tx?: TransactionStatus;
  txLink?: string;
  heading: string;
  description: string;
  isError?: boolean;
};

// For peg transactions, they will transition into using the
// full getTransactionDetails below
export function getPegEventDetails(
  config: AppConfig,
  pegEvent: PegEvent,
): TransactionDetails {
  const type = pegEvent?.type || null;
  switch (pegEvent?.type) {
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
    case "sent":
    case "tx_error": {
      return getTransactionDetails(config, pegEvent.tx);
    }
    default: {
      return null;
    }
  }
}

// For any old transaction
export function getTransactionDetails(
  config: AppConfig,
  tx: TransactionStatus,
): TransactionDetails {
  const txLink = tx.hash
    ? getBlockExplorerUrl(config.sifChainId, tx.hash)
    : null;

  const payload = {
    txLink,
    tx,
  };
  Object.assign(
    payload,
    (() => {
      switch (tx.state) {
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
            description: tx.memo || "",
          };
        }
        case "failed": {
          return {
            isError: true,
            heading: "Transaction Failed",
            description: tx.memo || "",
          };
        }
      }
    })(),
  );

  return payload as TransactionDetails;
}
