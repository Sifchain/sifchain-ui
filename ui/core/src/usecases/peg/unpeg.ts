import { isBroadcastTxFailure } from "@cosmjs/stargate";
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

type UnpegStore = Pick<Store, "wallet">;

export function Unpeg(services: UnpegServices, store: UnpegStore) {
  return async function unpeg(
    assetAmount: IAssetAmount,
    destinationNetwork: Network,
  ): Promise<TransactionStatus> {
    if (destinationNetwork === Network.COSMOSHUB) {
      const tx = await services.ibc.transferIBCTokens({
        sourceNetwork: Network.SIFCHAIN,
        destinationNetwork: Network.COSMOSHUB,
        assetAmountToTransfer: assetAmount,
      });
      if (isBroadcastTxFailure(tx)) {
        services.bus.dispatch({
          type: "ErrorEvent",
          payload: {
            message: "IBC Transfer Failed",
          },
        });
        return {
          hash: tx.transactionHash,
          state: "failed",
        };
      } else {
        return {
          state: "completed",
          hash: tx.transactionHash,
          memo: "Transaction Completed",
        };
      }
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
        type: "PegTransactionErrorEvent",
        payload: {
          txStatus,
          message: txStatus.memo || "There was an error while unpegging",
        },
      });
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
