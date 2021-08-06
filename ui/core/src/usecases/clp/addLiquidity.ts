import {
  ErrorCode,
  getErrorMessage,
  IAssetAmount,
  Asset,
} from "../../entities";
import { Services } from "../../services";
import { Store } from "../../store";
import { PoolStore } from "../../store/pools";
import { ReportTransactionError } from "../utils";

type PickBus = Pick<Services["bus"], "dispatch">;
type PickSif = Pick<Services["sif"], "getState" | "signAndBroadcast">;
type PickClp = Pick<Services["clp"], "addLiquidity" | "createPool">;

function findPool(pools: PoolStore, a: string, b: string) {
  const key = [a, b].sort().join("_");

  return pools[key] ?? null;
}

type AddLiquidityServices = {
  bus: PickBus;
  sif: PickSif;
  clp: PickClp;
  ibc: Services["ibc"];
};

type AddLiquidityStore = Pick<Store, "pools">;

export function AddLiquidity(
  { bus, clp, sif, ibc }: AddLiquidityServices,
  store: AddLiquidityStore,
) {
  return async (
    nativeAssetAmount: IAssetAmount,
    externalAssetAmount: IAssetAmount,
  ) => {
    console.log("IBC denom!! ADD LIQUIDITY!");
    const reportTransactionError = ReportTransactionError(bus);
    const state = sif.getState();
    if (!state.address) throw "No from address provided for swap";
    const hasPool = !!findPool(
      store.pools,
      nativeAssetAmount.asset.symbol,
      externalAssetAmount.asset.symbol,
    );

    const provideLiquidity = hasPool ? clp.addLiquidity : clp.createPool;

    const externalAssetDenom = Asset.get(externalAssetAmount.symbol).ibcDenom;

    console.log({
      nativeIbcDenom: nativeAssetAmount.asset.ibcDenom,
      externalIbcDenom: nativeAssetAmount.asset.ibcDenom,
      externalAssetDenom,
    });
    const tx = await provideLiquidity({
      fromAddress: state.address,
      nativeAssetAmount,
      externalAssetAmount,
    });

    const txStatus = await sif.signAndBroadcast(tx.value.msg);

    if (txStatus.state !== "accepted") {
      // Edge case where we have run out of native balance and need to represent that
      if (txStatus.code === ErrorCode.TX_FAILED_USER_NOT_ENOUGH_BALANCE) {
        return reportTransactionError({
          ...txStatus,
          code: ErrorCode.TX_FAILED_NOT_ENOUGH_ROWAN_TO_COVER_GAS,
          memo: getErrorMessage(
            ErrorCode.TX_FAILED_NOT_ENOUGH_ROWAN_TO_COVER_GAS,
          ),
        });
      }
    }
    return txStatus;
  };
}
