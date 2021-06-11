import { PegConfig } from ".";
import { IAssetAmount, Network, TransactionStatus } from "../../entities";
import { Services } from "../../services";
import { Store } from "../../store";
import { isSupportedEVMChain } from "../utils";
import { isOriginallySifchainNativeToken } from "./utils/isOriginallySifchainNativeToken";
import { SubscribeToTx } from "./utils/subscribeToTx";

type PegServices = {
  ethbridge: Pick<Services["ethbridge"], "burnToSifchain" | "lockToSifchain">;
  bus: Pick<Services["bus"], "dispatch">;
};

type PegStore = Pick<Store, "wallet" | "tx">;

export function Peg(services: PegServices, store: PegStore, config: PegConfig) {
  return async function peg(
    assetAmount: IAssetAmount,
  ): Promise<TransactionStatus> {
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
        hash: "",
        state: "failed",
      };
    }

    const subscribeToTx = SubscribeToTx({ services, store });

    const lockOrBurnFn = isOriginallySifchainNativeToken(assetAmount.asset)
      ? services.ethbridge.burnToSifchain
      : services.ethbridge.lockToSifchain;

    return await new Promise<TransactionStatus>((done) => {
      const pegTx = lockOrBurnFn(
        store.wallet.sif.address,
        assetAmount,
        config.ethConfirmations,
      );

      subscribeToTx(pegTx);

      pegTx.onTxHash((hash) => {
        done({
          hash: hash.txHash,
          memo: "Transaction Accepted",
          state: "accepted",
        });
      });
    });
  };
}
