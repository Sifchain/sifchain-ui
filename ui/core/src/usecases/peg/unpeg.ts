import { isBroadcastTxFailure } from "@cosmjs/stargate";
import { parseTxFailure } from "../../services/SifService/parseTxFailure";
import { IAssetAmount, Network, TransactionStatus } from "../../entities";
import { Services } from "../../services";
import { Store } from "../../store";
import { calculateUnpegFee } from "./utils/calculateExportFee";
import { isOriginallySifchainNativeToken } from "./utils/isOriginallySifchainNativeToken";

type UnpegServices = {
  ethbridge: Pick<Services["ethbridge"], "lockToEthereum" | "burnToEthereum">;
  sif: Pick<Services["sif"], "signAndBroadcast">;
  bus: Pick<Services["bus"], "dispatch">;
  ibc: Pick<Services["ibc"], "transferIBCTokens">;
};

export type UnpegApproveStartedEvent = { type: "approve_started" };
export type UnpegApprovedEvent = { type: "approved" };
export type UnpegSentEvent = { type: "sent"; tx: TransactionStatus };
export type UnpegTxError = { type: "tx_error"; tx: TransactionStatus };
export type UnpegApproveError = { type: "approve_error" };
export type UnpegSigningEvent = { type: "signing" };
export type UnpegEvent =
  | UnpegApproveStartedEvent
  | UnpegApprovedEvent
  | UnpegSigningEvent
  | UnpegSentEvent
  | UnpegTxError
  | UnpegApproveError;
type UnpegStore = Pick<Store, "wallet">;

export function Unpeg(services: UnpegServices, store: UnpegStore) {
  return async function* unpeg(
    assetAmount: IAssetAmount,
    destinationNetwork: Network,
  ): AsyncGenerator<UnpegEvent> {
    yield { type: "signing" };
    if (destinationNetwork === Network.COSMOSHUB) {
      const txSequence = await services.ibc.transferIBCTokens({
        sourceNetwork: Network.SIFCHAIN,
        destinationNetwork: Network.COSMOSHUB,
        assetAmountToTransfer: assetAmount,
      });
      for (let tx of txSequence) {
        if (isBroadcastTxFailure(tx)) {
          services.bus.dispatch({
            type: "ErrorEvent",
            payload: {
              message: "IBC Transfer Failed",
            },
          });
          yield {
            type: "tx_error",
            tx: parseTxFailure({
              transactionHash: tx.transactionHash,
              rawLog: tx.rawLog || "",
            }),
          };
        } else {
          yield {
            type: "sent",
            tx: {
              state: "completed",
              hash: tx.transactionHash,
              memo: "Transaction Completed",
            },
          };
        }
      }
      return;
    }
    const lockOrBurnFn = isOriginallySifchainNativeToken(assetAmount.asset)
      ? services.ethbridge.lockToEthereum
      : services.ethbridge.burnToEthereum;

    const feeAmount = calculateUnpegFee(assetAmount.asset);

    const tx = await lockOrBurnFn({
      assetAmount,
      ethereumRecipient: store.wallet.eth.address,
      fromAddress: store.wallet.sif.address,
      feeAmount,
    });

    const txStatus = await services.sif.signAndBroadcast(tx.value.msg);

    if (txStatus.state !== "accepted") {
      services.bus.dispatch({
        type: "TransactionErrorEvent",
        payload: {
          txStatus,
          message: txStatus.memo || "There was an error while unpegging",
        },
      });
      yield {
        type: "tx_error",
        tx: parseTxFailure({
          transactionHash: txStatus.hash,
          rawLog: txStatus.memo || "",
        }),
      };
    } else {
      yield {
        type: "sent",
        tx: txStatus,
      };
    }

    console.log(
      "unpeg txStatus.state",
      txStatus.state,
      txStatus.memo,
      txStatus.code,
      tx.value.msg,
    );

    return txStatus;
  };
}
