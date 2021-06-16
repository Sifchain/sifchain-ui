import {
  ErrorCode,
  getErrorMessage,
  IAsset,
  IAssetAmount,
} from "../../entities";
import { Services } from "../../services";
import { ReportTransactionError } from "../utils";

type PickBus = Pick<Services["bus"], "dispatch">;
type PickSif = Pick<Services["sif"], "getState" | "signAndBroadcast">;
type PickClp = Pick<Services["clp"], "swap">;

export type SwapArgs = {
  bus: PickBus;
  sif: PickSif;
  clp: PickClp;
};
export function Swap({ bus, sif, clp }: SwapArgs) {
  return async (
    sentAmount: IAssetAmount,
    receivedAsset: IAsset,
    minimumReceived: IAssetAmount,
  ) => {
    const reportTransactionError = ReportTransactionError(bus);
    const state = sif.getState();
    if (!state.address) throw new Error("No from address provided for swap");

    const tx = await clp.swap({
      fromAddress: state.address,
      sentAmount,
      receivedAsset,
      minimumReceived,
    });

    const txStatus = await sif.signAndBroadcast(tx.value.msg);

    if (txStatus.state !== "accepted") {
      // Edge case where we have run out of native balance and need to represent that
      if (
        txStatus.code === ErrorCode.TX_FAILED_USER_NOT_ENOUGH_BALANCE &&
        sentAmount.symbol === "rowan"
      ) {
        return reportTransactionError({
          ...txStatus,
          code: ErrorCode.TX_FAILED_NOT_ENOUGH_ROWAN_TO_COVER_GAS,
          memo: getErrorMessage(
            ErrorCode.TX_FAILED_NOT_ENOUGH_ROWAN_TO_COVER_GAS,
          ),
        });
      }

      return reportTransactionError(txStatus);
    }

    return txStatus;
  };
}
