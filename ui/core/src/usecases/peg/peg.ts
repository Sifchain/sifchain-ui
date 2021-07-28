import { PegConfig } from ".";
import { IAssetAmount, Network, TransactionStatus } from "../../entities";
import { Services } from "../../services";
import { Store } from "../../store";
import { isSupportedEVMChain } from "../utils";
import { isOriginallySifchainNativeToken } from "./utils/isOriginallySifchainNativeToken";
import { SubscribeToTx as SubscribeToTxDep } from "./utils/subscribeToTx";

type PegServices = {
  ethbridge: Pick<
    Services["ethbridge"],
    "burnToSifchain" | "lockToSifchain" | "approveBridgeBankSpend"
  >;
  bus: Pick<Services["bus"], "dispatch">;
  ibc: Pick<Services["ibc"], "transferIBCTokens">;
};

type PegStore = Pick<Store, "wallet" | "tx">;

export type PegApproveStartedEvent = { type: "approve_started" };
export type PegApprovedEvent = { type: "approved" };
export type PegSentEvent = { type: "sent"; tx: TransactionStatus };
export type PegTxError = { type: "tx_error"; tx: TransactionStatus };
export type PegApproveError = { type: "approve_error" };
export type PegSigningEvent = { type: "signing" };
export type PegEvent =
  | PegApproveStartedEvent
  | PegApprovedEvent
  | PegSigningEvent
  | PegSentEvent
  | PegTxError
  | PegApproveError;

export function Peg(
  services: PegServices,
  store: PegStore,
  config: PegConfig,
  SubscribeToTx = SubscribeToTxDep,
) {
  return async function* peg(
    assetAmount: IAssetAmount,
  ): AsyncGenerator<PegEvent> {
    if (assetAmount.asset.network === Network.COSMOSHUB) {
      const tx = await services?.ibc.transferIBCTokens({
        sourceNetwork: assetAmount.asset.network,
        destinationNetwork: Network.SIFCHAIN,
        assetAmountToTransfer: assetAmount,
      });
      // @ts-ignore
      if (tx.code) {
        console.log(tx);
        services.bus.dispatch({
          type: "ErrorEvent",
          payload: {
            message: "IBC Transfer Failed",
          },
        });
        return {
          type: "tx_error",
          tx: {
            hash: tx.transactionHash,
            state: "failed",
          },
        };
      } else {
        yield {
          type: "sent",
          tx: {
            hash: tx.transactionHash,
            memo: "Transaction Accepted",
            state: "accepted",
          },
        };
      }
      return;
    }
    if (
      assetAmount.asset.network === Network.ETHEREUM &&
      !isSupportedEVMChain(store.wallet.eth.chainId)
    ) {
      services.bus.dispatch({
        type: "ErrorEvent",
        payload: {
          message: "EVM Network not supported!",
        },
      });
      return {
        type: "tx_error",
        tx: {
          hash: "",
          state: "failed",
        },
      };
    }

    if (assetAmount.symbol !== "eth") {
      yield { type: "approve_started" };
      const address = store.wallet.eth.address;
      try {
        await services.ethbridge.approveBridgeBankSpend(address, assetAmount);
      } catch (err) {
        return yield {
          type: "approve_error",
        };
      }
      yield { type: "approved" };
    }

    yield { type: "signing" };

    const subscribeToTx = SubscribeToTx({ services, store });

    const lockOrBurnFn = isOriginallySifchainNativeToken(assetAmount.asset)
      ? services.ethbridge.burnToSifchain
      : services.ethbridge.lockToSifchain;

    const tx = await new Promise<TransactionStatus>((resolve) => {
      const pegTx = lockOrBurnFn(
        store.wallet.sif.address,
        assetAmount,
        config.ethConfirmations,
      );
      subscribeToTx(pegTx);

      pegTx.onTxHash((hash) => {
        resolve({
          hash: hash.txHash,
          memo: "Transaction Accepted",
          state: "accepted",
        });
      });
    });

    yield { type: "sent", tx };
  };
}
