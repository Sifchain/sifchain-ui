import { TransactionStatus } from "../../entities";
import { InterchainTx } from "../../usecases/interchain/_InterchainApi";

// Add more wallet types here as they come up
type WalletType = "sif" | "eth" | "cosmoshub";

type ErrorEvent = {
  type: "ErrorEvent";
  payload: {
    message: string;
    detail?: {
      type: "etherscan" | "info";
      message: string;
    };
  };
};

type SuccessEvent = {
  type: "SuccessEvent";
  payload: {
    message: string;
    detail?: {
      type: "etherscan" | "info";
      message: string;
    };
  };
};

type InfoEvent = {
  type: "InfoEvent";
  payload: {
    message: string;
    detail?: {
      type: "etherscan" | "info";
      message: string;
    };
  };
};

type TransactionErrorEvent = {
  type: "TransactionErrorEvent";
  payload: {
    txStatus: TransactionStatus;
    message: string;
  };
};

type WalletConnectedEvent = {
  type: "WalletConnectedEvent";
  payload: { walletType: WalletType; address: string };
};

type WalletDisconnectedEvent = {
  type: "WalletDisconnectedEvent";
  payload: { walletType: WalletType; address: string };
};

type WalletConnectionErrorEvent = {
  type: "WalletConnectionErrorEvent";
  payload: { walletType: WalletType; message: string };
};

type PegTransactionPendingEvent = {
  type: "PegTransactionPendingEvent";
  payload: {
    interchainTx: InterchainTx;
    transactionStatus: TransactionStatus;
  };
};

type PegTransactionCompletedEvent = {
  type: "PegTransactionCompletedEvent";
  payload: {
    interchainTx: InterchainTx;
    transactionStatus: TransactionStatus;
  };
};

type PegTransactionErrorEvent = {
  type: "PegTransactionErrorEvent";
  payload: {
    interchainTx: InterchainTx;
    transactionStatus: TransactionStatus;
  };
};

type NoLiquidityPoolsFoundEvent = {
  type: "NoLiquidityPoolsFoundEvent";
  payload: {};
};

export type AppEvent =
  | ErrorEvent
  | SuccessEvent
  | InfoEvent
  | WalletConnectedEvent
  | WalletDisconnectedEvent
  | WalletConnectionErrorEvent
  | PegTransactionPendingEvent
  | PegTransactionCompletedEvent
  | NoLiquidityPoolsFoundEvent
  | TransactionErrorEvent
  | PegTransactionErrorEvent;
