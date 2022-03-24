import { BaseChain } from "./_BaseChain";
import { urlJoin } from "url-join-ts";
export class EthereumChain extends BaseChain {
    getBlockExplorerUrlForTxHash(hash) {
        return urlJoin(this.chainConfig.blockExplorerUrl, "tx", hash);
    }
    getBlockExplorerUrlForAddress(address) {
        return urlJoin(this.chainConfig.blockExplorerUrl, "address", address);
    }
}
//# sourceMappingURL=EthereumChain.js.map