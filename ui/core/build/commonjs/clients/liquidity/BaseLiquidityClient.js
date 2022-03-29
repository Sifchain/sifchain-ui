"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseLiquidityClient = exports.DEFAULT_SWAP_SLIPPAGE_PERCENT = void 0;
const entities_1 = require("../../entities");
const native_1 = require("../native");
const TokenRegistry_1 = require("../native/TokenRegistry");
exports.DEFAULT_SWAP_SLIPPAGE_PERCENT = 1;
class BaseLiquidityClient {
  constructor(context, nativeChain) {
    this.context = context;
    this.nativeChain = nativeChain;
    this.tokenRegistry = (0, TokenRegistry_1.TokenRegistry)(this.context);
  }
  getNativeDexClient() {
    return __awaiter(this, void 0, void 0, function* () {
      if (!this.nativeDexClientPromise) {
        this.nativeDexClientPromise = native_1.NativeDexClient.connectByChain(
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
          return (0, entities_1.Pool)(
            (0, entities_1.AssetAmount)(
              this.nativeChain.nativeAsset,
              pool.nativeAssetBalance,
            ),
            (0, entities_1.AssetAmount)(asset, pool.externalAssetBalance),
            (0, entities_1.Amount)(pool.poolUnits),
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
      const pool = (0, entities_1.Pool)(
        (0, entities_1.AssetAmount)(
          this.nativeChain.nativeAsset,
          poolRes.pool.nativeAssetBalance || "0",
        ),
        (0, entities_1.AssetAmount)(
          params.asset,
          poolRes.pool.externalAssetBalance || "0",
        ),
        (0, entities_1.Amount)(poolRes.pool.poolUnits),
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
      return (0,
      entities_1.LiquidityProvider)(params.asset, (0, entities_1.Amount)(((_a = res.liquidityProvider) === null || _a === void 0 ? void 0 : _a.liquidityProviderUnits) || "0"), params.address, (0, entities_1.Amount)(res.nativeAssetBalance), (0, entities_1.Amount)(res.externalAssetBalance));
    });
  }
}
exports.BaseLiquidityClient = BaseLiquidityClient;
//# sourceMappingURL=BaseLiquidityClient.js.map
