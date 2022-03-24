import { urlJoin } from "url-join-ts";
import { BaseChain } from "./_BaseChain";
export class PersistenceChain extends BaseChain {
    getBlockExplorerUrlForTxHash(hash) {
        return urlJoin(this.chainConfig.blockExplorerUrl, "transactions", hash);
    }
    getBlockExplorerUrlForAddress(address) {
        return urlJoin(this.chainConfig.blockExplorerUrl, "wallet", address);
    }
}
//# sourceMappingURL=PersistenceChain.js.map