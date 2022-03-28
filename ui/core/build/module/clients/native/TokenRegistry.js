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
import {
  Network,
  Asset,
  AssetAmount,
  fromBaseUnits,
  toBaseUnits,
} from "../../";
import { NativeDexClient } from "../../clients";
export const TokenRegistry = (context) => {
  let tokenRegistryPromise;
  const loadTokenRegistry = () =>
    __awaiter(void 0, void 0, void 0, function* () {
      if (!tokenRegistryPromise) {
        tokenRegistryPromise = (() =>
          __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b;
            const dex = yield NativeDexClient.connect(
              context.sifRpcUrl,
              context.sifApiUrl,
              context.sifChainId,
            );
            const res = yield (_a = dex.query) === null || _a === void 0
              ? void 0
              : _a.tokenregistry.Entries({});
            const data =
              (_b = res === null || res === void 0 ? void 0 : res.registry) ===
                null || _b === void 0
                ? void 0
                : _b.entries;
            if (!data) throw new Error("Whitelist not found");
            return data;
          }))();
      }
      return tokenRegistryPromise;
    });
  const self = {
    load: () => loadTokenRegistry(),
    findAssetEntry: (asset) =>
      __awaiter(void 0, void 0, void 0, function* () {
        const items = yield loadTokenRegistry();
        return items.find((item) => item.baseDenom === asset.symbol);
      }),
    findAssetEntryOrThrow: (asset) =>
      __awaiter(void 0, void 0, void 0, function* () {
        const entry = yield self.findAssetEntry(asset);
        if (!entry)
          throw new Error("TokenRegistry entry not found for " + asset.symbol);
        return entry;
      }),
    loadCounterpartyEntry(nativeAsset) {
      return __awaiter(this, void 0, void 0, function* () {
        const entry = yield this.findAssetEntryOrThrow(nativeAsset);
        if (
          !entry.ibcCounterpartyDenom ||
          entry.ibcCounterpartyDenom === entry.denom
        ) {
          return entry;
        }
        const items = yield loadTokenRegistry();
        return items.find((item) => entry.ibcCounterpartyDenom === item.denom);
      });
    },
    loadCounterpartyAsset(nativeAsset) {
      return __awaiter(this, void 0, void 0, function* () {
        const entry = yield this.findAssetEntryOrThrow(nativeAsset);
        if (
          !entry.ibcCounterpartyDenom ||
          entry.ibcCounterpartyDenom === entry.denom
        ) {
          return nativeAsset;
        }
        const items = yield loadTokenRegistry();
        const counterpartyEntry = items.find(
          (item) => entry.ibcCounterpartyDenom === item.denom,
        );
        return Asset(
          Object.assign(Object.assign({}, nativeAsset), {
            symbol: counterpartyEntry.denom,
            decimals: +counterpartyEntry.decimals,
          }),
        );
      });
    },
    loadNativeAsset(counterpartyAsset) {
      return __awaiter(this, void 0, void 0, function* () {
        const entry = yield this.findAssetEntryOrThrow(counterpartyAsset);
        if (!entry.unitDenom || entry.unitDenom === entry.denom) {
          return counterpartyAsset;
        }
        const items = yield loadTokenRegistry();
        const nativeEntry = items.find(
          (item) => entry.unitDenom === item.denom,
        );
        return Asset(
          Object.assign(Object.assign({}, counterpartyAsset), {
            symbol: nativeEntry.denom,
            decimals: +nativeEntry.decimals,
          }),
        );
      });
    },
    loadCounterpartyAssetAmount: (nativeAssetAmount) =>
      __awaiter(void 0, void 0, void 0, function* () {
        yield self.load();
        const counterpartyAsset = yield self.loadCounterpartyAsset(
          nativeAssetAmount.asset,
        );
        const decimalAmount = fromBaseUnits(
          nativeAssetAmount.amount.toString(),
          nativeAssetAmount.asset,
        );
        const convertedIntAmount = toBaseUnits(
          decimalAmount,
          counterpartyAsset,
        );
        return AssetAmount(counterpartyAsset, convertedIntAmount);
      }),
    loadNativeAssetAmount: (assetAmount) =>
      __awaiter(void 0, void 0, void 0, function* () {
        yield self.load();
        const nativeAsset = yield self.loadNativeAsset(assetAmount.asset);
        const decimalAmount = fromBaseUnits(
          assetAmount.amount.toString(),
          assetAmount.asset,
        );
        const convertedIntAmount = toBaseUnits(decimalAmount, nativeAsset);
        return AssetAmount(nativeAsset, convertedIntAmount);
      }),
    loadConnection(params) {
      return __awaiter(this, void 0, void 0, function* () {
        const items = yield loadTokenRegistry();
        const sourceIsNative = params.fromChain.network === Network.SIFCHAIN;
        const counterpartyChain = sourceIsNative
          ? params.toChain
          : params.fromChain;
        const item = items.reverse().find((item) => {
          var _a;
          return (
            ((_a = item.baseDenom) === null || _a === void 0
              ? void 0
              : _a.toLowerCase()) ===
            counterpartyChain.nativeAsset.symbol.toLowerCase()
          );
        });
        // console.log("loadConnection", {
        //   ...params,
        //   counterpartyWhitelistItem: item,
        // });
        if (sourceIsNative) {
          return {
            channelId:
              item === null || item === void 0 ? void 0 : item.ibcChannelId,
          };
        } else {
          return {
            channelId:
              item === null || item === void 0
                ? void 0
                : item.ibcCounterpartyChannelId,
          };
        }
      });
    },
  };
  return self;
};
//# sourceMappingURL=TokenRegistry.js.map
