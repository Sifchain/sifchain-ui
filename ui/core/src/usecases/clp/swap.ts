import { NativeDexClient } from "../../services/utils/SifClient/NativeDexClient";
import {
  Amount,
  Asset,
  AssetAmount,
  ErrorCode,
  getErrorMessage,
  IAsset,
  IAssetAmount,
  Network,
} from "../../entities";
import { Services } from "../../services";
import { ReportTransactionError } from "../utils";
import getKeplrProvider from "services/SifService/getKeplrProvider";

type PickBus = Pick<Services["bus"], "dispatch">;
type PickSif = Pick<Services["sif"], "getState">;
type PickClp = Pick<Services["clp"], "swap">;

export type SwapArgs = Pick<
  Services,
  "bus" | "sif" | "clp" | "ibc" | "tokenRegistry"
>;
export function Swap({ bus, sif, clp, ibc, tokenRegistry }: SwapArgs) {
  return async (
    sentAmount: IAssetAmount,
    receivedAsset: IAsset,
    minimumReceived: IAssetAmount,
  ) => {
    const reportTransactionError = ReportTransactionError(bus);
    const state = sif.getState();
    if (!state.address) throw new Error("No from address provided for swap");
    const client = await sif.loadNativeDexClient();
    const tx = client.tx.clp.Swap(
      {
        sentAsset: {
          symbol: (await tokenRegistry.findAssetEntryOrThrow(sentAmount.asset))
            .denom,
        },
        receivedAsset: {
          symbol: (await tokenRegistry.findAssetEntryOrThrow(receivedAsset))
            .denom,
        },
        signer: sif.getState().address,
        sentAmount: sentAmount.toBigInt().toString(),
        minReceivingAmount: minimumReceived.toBigInt().toString(),
      },
      sif.getState().address,
    );
    const keplr = await getKeplrProvider();
    const signer = await keplr!.getOfflineSigner(
      await sif.unSignedClient.getChainId(),
    );
    const signed = await client.sign(tx, signer);
    const sent = await client.broadcast(signed);
    const txStatus = client.parseTxResult(sent);

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
