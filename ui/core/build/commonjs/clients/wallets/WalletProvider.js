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
exports.WalletProvider = void 0;
const entities_1 = require("../../entities");
const clients_1 = require("../../clients");
class WalletProvider {
  // default implementation. This should be overridden
  fetchBalance(chain, address, symbol) {
    return __awaiter(this, void 0, void 0, function* () {
      const balances = yield this.fetchBalances(chain, address);
      return (
        balances.find(
          (assetAmount) =>
            assetAmount.symbol.toLowerCase() === symbol.toLowerCase(),
        ) || (0, entities_1.AssetAmount)(symbol, "0")
      );
    });
  }
  // Parse to dex-v1 compatible output
  parseTxResultToStatus(result) {
    return clients_1.NativeDexClient.parseTxResult(result);
  }
}
exports.WalletProvider = WalletProvider;
//# sourceMappingURL=WalletProvider.js.map
