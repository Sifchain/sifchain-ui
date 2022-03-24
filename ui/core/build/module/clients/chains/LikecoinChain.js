import { BaseChain } from "./_BaseChain";
import { urlJoin } from "url-join-ts";
export class LikecoinChain extends BaseChain {
    getBlockExplorerUrlForTxHash(hash) {
        return urlJoin(this.chainConfig.blockExplorerUrl, "transactions", hash);
    }
    getBlockExplorerUrlForAddress(hash) {
        return urlJoin(this.chainConfig.blockExplorerUrl, "accounts", hash);
    }
}
//# sourceMappingURL=LikecoinChain.js.map