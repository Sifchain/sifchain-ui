import { Services } from "../../services";
import { Store } from "../../store";
import { Asset, Pool, AssetAmount, Amount } from "../../entities";
import { isIBCDenom } from "../../services/utils/IbcService";
import { createPoolKey } from "../../utils";
import { AccountPool } from "../../store/pools";

type PickSif = Pick<Services["sif"], "getState">;
type PickIbc = Pick<Services["ibc"], "symbolLookup">;
type PickClp = Pick<
  Services["clp"],
  "getPoolSymbolsByLiquidityProvider" | "getRawPools" | "getLiquidityProvider"
>;
type SyncPoolsArgs = {
  ibc: PickIbc;
  sif: PickSif;
  clp: PickClp;
};

type SyncPoolsStore = Pick<Store, "accountpools" | "pools">;

function getAssetOrNull(symbol: string): Asset | null {
  try {
    return Asset.get(symbol);
  } catch (err) {
    return null;
  }
}

export function SyncPools(
  { ibc, sif, clp }: SyncPoolsArgs,
  store: SyncPoolsStore,
) {
  return async function syncPools() {
    const state = sif.getState();

    // UPdate pools
    const nativeAsset = Asset.get("rowan");
    const rawPools = await clp.getRawPools();
    const pools = rawPools
      .map((pool) => {
        let externalSymbol = pool.external_asset.symbol;
        if (isIBCDenom(externalSymbol)) {
          externalSymbol = ibc.symbolLookup[externalSymbol];
        }

        const externalAsset = getAssetOrNull(externalSymbol);
        if (!externalAsset) return null;

        return Pool(
          AssetAmount(nativeAsset, pool.native_asset_balance),
          AssetAmount(externalAsset, pool.external_asset_balance),
          Amount(pool.pool_units),
        );
      })
      .filter((val) => val != null) as Pool[];

    // const pools = await clp.getPools();
    for (let pool of pools) {
      store.pools[pool.symbol()] = pool;
    }

    // Update lp pools
    if (state.address) {
      const accountPoolSymbols = await clp.getPoolSymbolsByLiquidityProvider(
        state.address,
      );

      // This is a hot method when there are a heap of pools
      // Ideally we would have a better rest endpoint design

      const currentAccountPools: Record<string, AccountPool> = {};
      if (!store.accountpools[state.address]) {
        store.accountpools[state.address] = {};
      }

      await Promise.all(
        accountPoolSymbols.map(async (symbol) => {
          const assetSymbol = isIBCDenom(symbol)
            ? ibc.symbolLookup[symbol]
            : symbol;

          const lp = await clp.getLiquidityProvider({
            assetSymbol,
            symbol,
            lpAddress: state.address,
          });

          const asset = getAssetOrNull(assetSymbol);

          if (!lp || !asset) return;

          const pool = createPoolKey(asset, Asset.get("rowan"));

          currentAccountPools[pool] = { lp, pool };
        }),
      );

      Object.keys(store.accountpools[state.address]).forEach((poolId) => {
        // If pool is gone now, delete. Ie user remioved all liquidity
        if (!currentAccountPools[poolId]) {
          delete store.accountpools[state.address][poolId];
        }
      });
      Object.keys(currentAccountPools).forEach((poolId) => {
        store.accountpools[state.address][poolId] = currentAccountPools[poolId];
      });
    }
  };
}
