import { urlJoin } from "url-join-ts";
import { BaseChain } from "./_BaseChain";
export class IxoChain extends BaseChain {
    getBlockExplorerUrlForTxHash(hash) {
        return urlJoin(this.chainConfig.blockExplorerUrl, "/cosmos/tx/v1beta1/txs/", hash);
    }
    getBlockExplorerUrlForAddress(address) {
        return urlJoin(this.chainConfig.blockExplorerUrl, "/cosmos/bank/v1beta1/balances/", address);
    }
}
//# sourceMappingURL=IxoChain.js.map