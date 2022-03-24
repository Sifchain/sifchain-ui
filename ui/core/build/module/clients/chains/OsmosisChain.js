import { urlJoin } from "url-join-ts";
import { BaseChain } from "./_BaseChain";
export class OsmosisChain extends BaseChain {
    getBlockExplorerUrlForTxHash(hash) {
        return urlJoin(this.chainConfig.blockExplorerUrl, "txs", hash);
    }
    getBlockExplorerUrlForAddress(hash) {
        return urlJoin(this.chainConfig.blockExplorerUrl, "account", hash);
    }
}
//# sourceMappingURL=OsmosisChain.js.map