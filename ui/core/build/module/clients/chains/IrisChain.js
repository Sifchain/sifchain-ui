import { BaseChain } from "./_BaseChain";
export class IrisChain extends BaseChain {
  getBlockExplorerUrlForAddress(address) {
    return this.chainConfig.blockExplorerUrl + `#/address/${address}`;
  }
  getBlockExplorerUrlForTxHash(hash) {
    return this.chainConfig.blockExplorerUrl + `#/tx?txHash=${hash}`;
  }
}
//# sourceMappingURL=IrisChain.js.map
