import { urlJoin } from "url-join-ts";
import { BaseChain } from "./_BaseChain";
export class CryptoOrgChain extends BaseChain {
    getBlockExplorerUrlForTxHash(hash) {
        return urlJoin(this.chainConfig.blockExplorerUrl, "tx", hash);
    }
    getBlockExplorerUrlForAddress(address) {
        return urlJoin(this.chainConfig.blockExplorerUrl, "account", address);
    }
}
//# sourceMappingURL=CryptoOrgChain.js.map