import {
  DEFAULT_FEE,
  IAsset,
  SifchainEncodeObject,
  SifSigningStargateClient,
  TransactionStatus,
} from "@sifchain/sdk";

import runCatching from "~/utils/runCatching";
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
  tokenRegistry: Services["tokenRegistry"];
  wallet: Services["wallet"];
  chains: Services["chains"];
};

export function RemoveLiquidity({
  bus,
  sif,
  wallet,
  chains,
  tokenRegistry,
}: RemoveLiquidityServices) {
  return async (asset: IAsset, wBasisPoints: string, asymmetry: string) => {
    const client = await sif.loadNativeDexClient();
    /*
     @mccallofthewild - This usecase (if we don't kill it altogether in lieu 
     of an all-powerful `NativeDexClient`) should really take in an address argument instead
     of reading state here. Leaving it now to speed up ledger implementation
    */
    const { address } = sif.getState();
    const externalAssetEntry = await tokenRegistry.findAssetEntryOrThrow(asset);
    const tx = client.tx.clp.RemoveLiquidity(
      {
        asymmetry,
        wBasisPoints,
        externalAsset: {
          symbol: externalAssetEntry.denom,
        },
        signer: address,
      },
      address,
    );

    const stargateClient = await SifSigningStargateClient.connectWithSigner(
      sif.unSignedClient.rpcUrl,
      await wallet.keplrProvider.getOfflineSignerAuto(chains.nativeChain),
    );
    const [error, sentTx] = await runCatching(() =>
      stargateClient.signAndBroadcast(
        tx.fromAddress,
        tx.msgs as SifchainEncodeObject[],
        tx.fee
          ? {
              amount: [tx.fee.price],
              gas: tx.fee.gas,
            }
          : DEFAULT_FEE,
      ),
    );

    if (error !== undefined) {
      return {
        state: "rejected",
        hash: "",
      } as TransactionStatus;
    }

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
