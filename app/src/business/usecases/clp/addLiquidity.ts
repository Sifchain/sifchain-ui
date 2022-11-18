import {
  createPoolKey,
  DEFAULT_FEE,
  ErrorCode,
  getErrorMessage,
  IAssetAmount,
  SifchainEncodeObject,
  SifSigningStargateClient,
  TransactionStatus,
  transactionStatusFromDeliverTxResponse,
} from "@sifchain/sdk";

import { Services } from "~/business/services";
import { Store } from "~/business/store";
import { PoolStore } from "~/business/store/pools";
import runCatching from "~/utils/runCatching";
import { ReportTransactionError } from "../utils";

type PickBus = Pick<Services["bus"], "dispatch">;
type PickSif = Pick<
  Services["sif"],
  "getState" | "signAndBroadcast" | "unSignedClient" | "loadNativeDexClient"
>;
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
  wallet: Services["wallet"];
  tokenRegistry: Services["tokenRegistry"];
  chains: Services["chains"];
};

type AddLiquidityStore = Pick<Store, "pools">;

export function AddLiquidity(
  { bus, sif, tokenRegistry, wallet, chains }: AddLiquidityServices,
  store: AddLiquidityStore,
) {
  return async (
    nativeAssetAmount: IAssetAmount,
    externalAssetAmount: IAssetAmount,
  ): Promise<TransactionStatus> => {
    const client = await sif.loadNativeDexClient();
    const address = await wallet.keplrProvider.connect(chains.nativeChain);
    const externalAssetEntry = await tokenRegistry.findAssetEntryOrThrow(
      externalAssetAmount.asset,
    );
    const hasPool = !!findPool(
      store.pools,
      nativeAssetAmount.asset.symbol,
      externalAssetAmount.asset.symbol,
    );
    const reportTransactionError = ReportTransactionError(bus);
    const state = sif.getState();
    if (!state.address) {
      throw "No from address provided for swap";
    }

    const tx = hasPool
      ? client.tx.clp.AddLiquidity(
          {
            externalAsset: {
              symbol: externalAssetEntry.denom,
            },
            externalAssetAmount: externalAssetAmount.toBigInt().toString(),
            nativeAssetAmount: nativeAssetAmount.toBigInt().toString(),
            signer: address,
          },
          address,
        )
      : client.tx.clp.CreatePool(
          {
            externalAsset: {
              symbol: externalAssetEntry.denom,
            },
            externalAssetAmount: externalAssetAmount.toBigInt().toString(),
            nativeAssetAmount: nativeAssetAmount.toBigInt().toString(),
            signer: address,
          },
          address,
        );

    const signingClient = await SifSigningStargateClient.connectWithSigner(
      sif.unSignedClient.rpcUrl,
      await wallet.keplrProvider.getOfflineSignerAuto(chains.nativeChain),
    );

    const [error, sentTx] = await runCatching(() =>
      signingClient.signAndBroadcast(
        address,
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
      };
    }

    const txStatus = transactionStatusFromDeliverTxResponse(sentTx);
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
