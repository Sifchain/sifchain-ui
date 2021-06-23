import { IAssetAmount } from "../../entities";
import { Services } from "../../services";
import { Store } from "../../store";
import { calculateUnpegFee } from "./utils/calculateUnpegFee";
import { isOriginallySifchainNativeToken } from "./utils/isOriginallySifchainNativeToken";

type UnpegServices = {
  ethbridge: Pick<Services["ethbridge"], "lockToEthereum" | "burnToEthereum">;
  sif: Pick<Services["sif"], "signAndBroadcast">;
  bus: Pick<Services["bus"], "dispatch">;
};

type UnpegStore = Pick<Store, "wallet">;

export function Unpeg(services: UnpegServices, store: UnpegStore) {
  return async function unpeg(assetAmount: IAssetAmount) {
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
