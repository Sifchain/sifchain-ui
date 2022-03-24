var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { AssetAmount, } from "../../entities";
import { NativeDexClient, } from "../../clients";
export class WalletProvider {
    // default implementation. This should be overridden
    fetchBalance(chain, address, symbol) {
        return __awaiter(this, void 0, void 0, function* () {
            const balances = yield this.fetchBalances(chain, address);
            return (balances.find((assetAmount) => assetAmount.symbol.toLowerCase() === symbol.toLowerCase()) || AssetAmount(symbol, "0"));
        });
    }
    // Parse to dex-v1 compatible output
    parseTxResultToStatus(result) {
        return NativeDexClient.parseTxResult(result);
    }
}
//# sourceMappingURL=WalletProvider.js.map