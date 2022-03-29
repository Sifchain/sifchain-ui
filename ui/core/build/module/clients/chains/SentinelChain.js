import { urlJoin } from "url-join-ts";
import { BaseChain } from "./_BaseChain";
export class SentinelChain extends BaseChain {
  getBlockExplorerUrlForTxHash(hash) {
    return urlJoin(this.chainConfig.blockExplorerUrl, "transactions", hash);
  }
  getBlockExplorerUrlForAddress(address) {
    return urlJoin(this.chainConfig.blockExplorerUrl, "accounts", address);
  }
}
//# sourceMappingURL=SentinelChain.js.map
