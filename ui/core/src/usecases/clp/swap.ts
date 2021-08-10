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

type PickBus = Pick<Services["bus"], "dispatch">;
type PickSif = Pick<Services["sif"], "getState" | "signAndBroadcast">;
type PickClp = Pick<Services["clp"], "swap">;

export type SwapArgs = {
  bus: PickBus;
  sif: PickSif;
  clp: PickClp;
  ibc: Pick<Services["ibc"], "loadChainConfigByNetwork">;
};
export function Swap({ bus, sif, clp, ibc }: SwapArgs) {
  return async (
    sentAmount: IAssetAmount,
    receivedAsset: IAsset,
    minimumReceived: IAssetAmount,
  ) => {
    const reportTransactionError = ReportTransactionError(bus);
    const state = sif.getState();
    if (!state.address) throw new Error("No from address provided for swap");
    await new NativeDexClient(
      await ibc.loadChainConfigByNetwork(Network.SIFCHAIN).rpcUrl,
    ).connect(async (dex) => {
      const whitelist = await dex.query?.tokenregistry.Entries({});
      console.log({ whitelist });
      whitelist?.registry?.entries.forEach((entry) => {
        if (
          entry.baseDenom.toLowerCase() ===
          sentAmount.asset.symbol.toLowerCase()
        ) {
          sentAmount = AssetAmount(
            Asset({
              ...sentAmount.asset,
              symbol: entry.denom,
            }),
            sentAmount.amount,
          );
        }
        if (
          entry.baseDenom.toLowerCase() === receivedAsset.symbol.toLowerCase()
        ) {
          receivedAsset = Asset({
            ...receivedAsset,
            symbol: entry.denom,
          });
        }
        if (
          entry.baseDenom.toLowerCase() ===
          minimumReceived.asset.symbol.toLowerCase()
        ) {
          minimumReceived = AssetAmount(
            Asset({
              ...minimumReceived.asset,
              symbol: entry.denom,
            }),
            minimumReceived.amount,
          );
        }
      });
      debugger;
    });

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
