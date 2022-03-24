"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SentinelChain = void 0;
const url_join_ts_1 = require("url-join-ts");
const _BaseChain_1 = require("./_BaseChain");
class SentinelChain extends _BaseChain_1.BaseChain {
    getBlockExplorerUrlForTxHash(hash) {
        return (0, url_join_ts_1.urlJoin)(this.chainConfig.blockExplorerUrl, "transactions", hash);
    }
    getBlockExplorerUrlForAddress(address) {
        return (0, url_join_ts_1.urlJoin)(this.chainConfig.blockExplorerUrl, "accounts", address);
    }
}
exports.SentinelChain = SentinelChain;
//# sourceMappingURL=SentinelChain.js.map