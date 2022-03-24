import { BaseChain } from "./_BaseChain";
import { urlJoin } from "url-join-ts";
export class BandChain extends BaseChain {
    getBlockExplorerUrlForTxHash(hash) {
        return urlJoin(this.chainConfig.blockExplorerUrl, "tx", hash);
    }
}
//# sourceMappingURL=BandChain.js.map