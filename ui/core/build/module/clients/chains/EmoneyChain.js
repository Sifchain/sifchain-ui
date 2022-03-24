import { BaseChain } from "./_BaseChain";
import { urlJoin } from "url-join-ts";
export class EmoneyChain extends BaseChain {
    getBlockExplorerUrlForTxHash(hash) {
        return urlJoin(this.chainConfig.blockExplorerUrl, "txs", hash);
    }
    getBlockExplorerUrlForAddress(hash) {
        return urlJoin(this.chainConfig.blockExplorerUrl, "account", hash);
    }
}
//# sourceMappingURL=EmoneyChain.js.map