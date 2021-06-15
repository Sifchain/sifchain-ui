import {
  ErrorCode,
  getErrorMessage,
  IAsset,
  IAssetAmount,
} from "../../entities";
import { UsecaseContext } from "..";
import { PoolStore } from "../../store/pools";
import { effect } from "@vue/reactivity";
import { ReportTransactionError } from "../utils";
import { Swap } from "./swap";

export default ({
  services,
  store,
}: UsecaseContext<
  "sif" | "clp" | "bus",
  "pools" | "wallet" | "accountpools"
>) => {
  const reportTransactionError = ReportTransactionError(services.bus);

  const state = services.sif.getState();

  async function syncPools() {
    const state = services.sif.getState();

    // UPdate pools
    const pools = await services.clp.getPools();
    for (let pool of pools) {
      store.pools[pool.symbol()] = pool;
    }

    // Update lp pools
    if (state.address) {
      const accountPoolSymbols = await services.clp.getPoolSymbolsByLiquidityProvider(
        state.address,
      );

      // This is a hot method when there are a heap of pools
      // Ideally we would have a better rest endpoint design

      accountPoolSymbols.forEach(async (symbol) => {
        const lp = await services.clp.getLiquidityProvider({
          symbol,
          lpAddress: state.address,
        });
        if (!lp) return;
        const pool = `${symbol}_rowan`;
        store.accountpools[state.address] =
          store.accountpools[state.address] || {};

        store.accountpools[state.address][pool] = { lp, pool };
      });

      // Delete accountpools
      const currentPoolIds = accountPoolSymbols.map((id) => `${id}_rowan`);
      if (store.accountpools[state.address]) {
        const existingPoolIds = Object.keys(store.accountpools[state.address]);
        const disjunctiveIds = existingPoolIds.filter(
          (id) => !currentPoolIds.includes(id),
        );

        disjunctiveIds.forEach((poolToRemove) => {
          delete store.accountpools[state.address][poolToRemove];
        });
      }
    }
  }

  // Sync on load
  syncPools().then(() => {
    effect(() => {
      if (Object.keys(store.pools).length === 0) {
        services.bus.dispatch({
          type: "NoLiquidityPoolsFoundEvent",
          payload: {},
        });
      }
    });
  });

  // Then every transaction

  services.sif.onNewBlock(async () => {
    await syncPools();
  });

  function findPool(pools: PoolStore, a: string, b: string) {
    const key = [a, b].sort().join("_");

    return pools[key] ?? null;
  }

  effect(() => {
    // When sif address changes syncPools
    store.wallet.sif.address;
    syncPools();
  });

  const actions = {
    swap: Swap(services),
    async addLiquidity(
      nativeAssetAmount: IAssetAmount,
      externalAssetAmount: IAssetAmount,
    ) {
      if (!state.address) throw "No from address provided for swap";
      const hasPool = !!findPool(
        store.pools,
        nativeAssetAmount.asset.symbol,
        externalAssetAmount.asset.symbol,
      );

      const provideLiquidity = hasPool
        ? services.clp.addLiquidity
        : services.clp.createPool;

      const tx = await provideLiquidity({
        fromAddress: state.address,
        nativeAssetAmount,
        externalAssetAmount,
      });

      const txStatus = await services.sif.signAndBroadcast(tx.value.msg);

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
    },

    async removeLiquidity(
      asset: IAsset,
      wBasisPoints: string,
      asymmetry: string,
    ) {
      const tx = await services.clp.removeLiquidity({
        fromAddress: state.address,
        asset,
        asymmetry,
        wBasisPoints,
      });

      const txStatus = await services.sif.signAndBroadcast(tx.value.msg);

      if (txStatus.state !== "accepted") {
        services.bus.dispatch({
          type: "TransactionErrorEvent",
          payload: {
            txStatus,
            message: txStatus.memo || "There was an error removing liquidity",
          },
        });
      }

      return txStatus;
    },

    async disconnect() {
      services.sif.purgeClient();
    },
  };

  return actions;
};
