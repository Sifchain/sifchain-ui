import getKeplrProvider from "services/SifService/getKeplrProvider";
import { IAsset } from "../../entities";
import { Services } from "../../services";

type PickBus = Pick<Services["bus"], "dispatch">;
type PickSif = Pick<
  Services["sif"],
  "getState" | "signAndBroadcast" | "loadNativeDexClient" | "unSignedClient"
>;
type PickClp = Pick<Services["clp"], "removeLiquidity">;

type RemoveLiquidityServices = {
  bus: PickBus;
  sif: PickSif;
  clp: PickClp;
};

export function RemoveLiquidity({ bus, sif, clp }: RemoveLiquidityServices) {
  return async (asset: IAsset, wBasisPoints: string, asymmetry: string) => {
    const client = await sif.loadNativeDexClient();

    const txDraft = await client.tx.clp.RemoveLiquidity(
      {
        asymmetry,
        wBasisPoints,
        externalAsset: {
          symbol: asset.symbol,
        },
        /*
         @mccallofthewild - This usecase (if we don't kill it altogether in lieu 
         of an all-powerful `NativeDexClient`) should really take in an address argument instead
         of reading state here. Leaving it now to speed up ledger implementation
        */
        signer: sif.getState().address,
      },
      sif.getState().address,
    );
    const keplr = await getKeplrProvider();
    const signer = await keplr!.getOfflineSigner(
      await sif.unSignedClient.getChainId(),
    );
    const signedTx = await client.sign(txDraft, signer);
    const sentTx = await client.broadcast(signedTx);
    const txStatus = client.parseTxResult(sentTx);
    if (txStatus.state !== "accepted") {
      bus.dispatch({
        type: "TransactionErrorEvent",
        payload: {
          txStatus,
          message: txStatus.memo || "There was an error removing liquidity",
        },
      });
    }

    return txStatus;
  };
}
