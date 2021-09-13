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
import { createPoolKey } from "../../utils";
import { NativeDexClient } from "services/utils/SifClient/NativeDexClient";
import getKeplrProvider from "services/SifService/getKeplrProvider";

type PickBus = Pick<Services["bus"], "dispatch">;
type PickSif = Services["sif"];
type PickClp = Pick<Services["clp"], "addLiquidity" | "createPool">;

function findPool(
  pools: PoolStore,
  nativeSymbol: string,
  externalSymbol: string,
) {
  return pools[createPoolKey(nativeSymbol, externalSymbol)] ?? null;
}

type AddLiquidityServices = {
  bus: PickBus;
  sif: PickSif;
  clp: PickClp;
  ibc: Services["ibc"];
  tokenRegistry: Services["tokenRegistry"];
  chains: Services["chains"];
};

type AddLiquidityStore = Pick<Store, "pools">;

export function AddLiquidity(
  { bus, clp, sif, ibc, tokenRegistry, chains }: AddLiquidityServices,
  store: AddLiquidityStore,
) {
  return async (
    nativeAssetAmount: IAssetAmount,
    externalAssetAmount: IAssetAmount,
  ) => {
    const client = await sif.loadNativeDexClient();
    const keplr = await getKeplrProvider();
    const signer = await keplr!.getOfflineSigner(
      await sif.unSignedClient.getChainId(),
    );
    const [account] = (await signer?.getAccounts()) || [];
    const externalAssetEntry = await tokenRegistry.findAssetEntryOrThrow(
      externalAssetAmount.asset,
    );

    const reportTransactionError = ReportTransactionError(bus);
    const state = sif.getState();
    if (!state.address) throw "No from address provided for swap";
    const hasPool = !!findPool(
      store.pools,
      nativeAssetAmount.asset.symbol,
      externalAssetAmount.asset.symbol,
    );
    const txDraft = hasPool
      ? await client.tx.clp.AddLiquidity(
          {
            externalAsset: {
              symbol: externalAssetEntry.denom,
            },
            externalAssetAmount: externalAssetAmount.toBigInt().toString(),
            nativeAssetAmount: nativeAssetAmount.toBigInt().toString(),
            signer: account.address,
          },
          account.address,
        )
      : await client.tx.clp.CreatePool(
          {
            externalAsset: {
              symbol: externalAssetEntry.denom,
            },
            externalAssetAmount: externalAssetAmount.toBigInt().toString(),
            nativeAssetAmount: nativeAssetAmount.toBigInt().toString(),
            signer: account.address,
          },
          account.address,
        );

    const signedTx = await client.sign(txDraft, signer);
    const sentTx = await client.broadcast(signedTx);
    const txStatus = await NativeDexClient.parseTxResult(sentTx);

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
