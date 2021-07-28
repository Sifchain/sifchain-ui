import { IAsset } from "../../entities";
import { Services } from "../../services";

type PickBus = Pick<Services["bus"], "dispatch">;
type PickSif = Pick<Services["sif"], "getState" | "signAndBroadcast">;
type PickClp = Pick<Services["clp"], "removeLiquidity">;

type RemoveLiquidityServices = {
  bus: PickBus;
  sif: PickSif;
  clp: PickClp;
};

export function RemoveLiquidity({ bus, sif, clp }: RemoveLiquidityServices) {
  return async (asset: IAsset, wBasisPoints: string, asymmetry: string) => {
    const state = sif.getState();

    const tx = await clp.removeLiquidity({
      fromAddress: state.address,
      asset,
      asymmetry,
      wBasisPoints,
    });

    const txStatus = await sif.signAndBroadcast(tx.value.msg);

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
