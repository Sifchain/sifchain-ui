"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StarnameChain = void 0;
const url_join_ts_1 = require("url-join-ts");
const _BaseChain_1 = require("./_BaseChain");
class StarnameChain extends _BaseChain_1.BaseChain {
  getBlockExplorerUrlForTxHash(hash) {
    return (0, url_join_ts_1.urlJoin)(
      this.chainConfig.blockExplorerUrl,
      "tx",
      hash,
    );
  }
  getBlockExplorerUrlForAddress(hash) {
    return (0, url_join_ts_1.urlJoin)(
      this.chainConfig.blockExplorerUrl,
      "account",
      hash,
    );
  }
}
exports.StarnameChain = StarnameChain;
//# sourceMappingURL=StarnameChain.js.map
