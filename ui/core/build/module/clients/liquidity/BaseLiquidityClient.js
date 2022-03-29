var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
import { AssetAmount, Amount, Pool, LiquidityProvider } from "../../entities";
import { NativeDexClient } from "../native";
import { TokenRegistry } from "../native/TokenRegistry";
export const DEFAULT_SWAP_SLIPPAGE_PERCENT = 1;
export class BaseLiquidityClient {
  constructor(context, nativeChain) {
    this.context = context;
    this.nativeChain = nativeChain;
    this.tokenRegistry = TokenRegistry(this.context);
  }
  getNativeDexClient() {
    return __awaiter(this, void 0, void 0, function* () {
      if (!this.nativeDexClientPromise) {
        this.nativeDexClientPromise = NativeDexClient.connectByChain(
          this.nativeChain,
        );
      }
      return this.nativeDexClientPromise;
    });
  }
  /**
   * Fetch all available liquidity pools.
   */
  fetchAllPools() {
    return __awaiter(this, void 0, void 0, function* () {
      const client = yield this.getNativeDexClient();
      const res = yield client.query.clp.GetPools({});
      const registry = yield this.tokenRegistry.load();
      return res.pools
        .map((pool) => {
          var _a;
          const externalSymbol =
            (_a = pool.externalAsset) === null || _a === void 0
              ? void 0
              : _a.symbol;
          const entry = registry.find(
            (item) =>
              item.denom === externalSymbol ||
              item.baseDenom === externalSymbol,
          );
          if (!entry) return null;
          const asset = this.nativeChain.findAssetWithLikeSymbol(
            entry.baseDenom,
          );
          if (!asset) {
            console.log(entry, externalSymbol);
          }
          if (!asset) return null;
          return Pool(
            AssetAmount(this.nativeChain.nativeAsset, pool.nativeAssetBalance),
            AssetAmount(asset, pool.externalAssetBalance),
            Amount(pool.poolUnits),
          );
        })
        .filter((i) => i != null);
    });
  }
  /*
   * Fetch the liquidity pool associated with the given external asset.
   */
  fetchPool(params) {
    return __awaiter(this, void 0, void 0, function* () {
      const client = yield this.getNativeDexClient();
      const entry = yield this.tokenRegistry.findAssetEntryOrThrow(
        params.asset,
      );
      const poolRes = yield client.query.clp.GetPool({
        symbol: entry.denom,
      });
      if (!(poolRes === null || poolRes === void 0 ? void 0 : poolRes.pool))
        return;
      const pool = Pool(
        AssetAmount(
          this.nativeChain.nativeAsset,
          poolRes.pool.nativeAssetBalance || "0",
        ),
        AssetAmount(params.asset, poolRes.pool.externalAssetBalance || "0"),
        Amount(poolRes.pool.poolUnits),
      );
      return pool;
    });
  }
  /*
   * Fetch liquidity provider data for the given address (if it exists)
   * matching the given external asset.
   */
  fetchLiquidityProvider(params) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
      const client = yield this.getNativeDexClient();
      const entry = yield this.tokenRegistry.findAssetEntryOrThrow(
        params.asset,
      );
      const res = yield client.query.clp.GetLiquidityProvider({
        lpAddress: params.address,
        symbol: entry.denom,
      });
      return LiquidityProvider(
        params.asset,
        Amount(
          ((_a = res.liquidityProvider) === null || _a === void 0
            ? void 0
            : _a.liquidityProviderUnits) || "0",
        ),
        params.address,
        Amount(res.nativeAssetBalance),
        Amount(res.externalAssetBalance),
      );
    });
  }
}
//# sourceMappingURL=BaseLiquidityClient.js.map
