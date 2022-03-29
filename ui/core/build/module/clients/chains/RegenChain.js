import { urlJoin } from "url-join-ts";
import { BaseChain } from "./_BaseChain";
export class RegenChain extends BaseChain {
  getBlockExplorerUrlForTxHash(hash) {
    return urlJoin(this.chainConfig.blockExplorerUrl, "txs", hash);
  }
}
//# sourceMappingURL=RegenChain.js.map
