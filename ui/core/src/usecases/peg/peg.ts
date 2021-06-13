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
};

type PegStore = Pick<Store, "wallet" | "tx">;

export type PegStartedEvent = { type: "started" };
export type PegApprovedEvent = { type: "approved" };
export type PegSentEvent = { type: "sent"; tx: TransactionStatus };
export type PegTxError = { type: "tx_error"; tx: TransactionStatus };
export type PegEvent =
  | PegStartedEvent
  | PegApprovedEvent
  | PegSentEvent
  | PegTxError;

export function Peg(
  services: PegServices,
  store: PegStore,
  config: PegConfig,
  SubscribeToTx = SubscribeToTxDep,
) {
  return async function* peg(
    assetAmount: IAssetAmount,
  ): AsyncGenerator<PegEvent, PegEvent> {
    yield { type: "started" } as PegStartedEvent;

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
      } as PegTxError;
    }

    const address = store.wallet.eth.address;
    await services.ethbridge.approveBridgeBankSpend(address, assetAmount);

    yield { type: "approved" };

    const subscribeToTx = SubscribeToTx({ services, store });

    const lockOrBurnFn = isOriginallySifchainNativeToken(assetAmount.asset)
      ? services.ethbridge.burnToSifchain
      : services.ethbridge.lockToSifchain;

    const tx = await new Promise<TransactionStatus>((done) => {
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

    return { type: "sent", tx } as PegSentEvent;
  };
}
