import { BaseChain } from "./_BaseChain";
export class TerraChain extends BaseChain {
  getBlockExplorerUrlForAddress(address) {
    return this.chainConfig.blockExplorerUrl + `#/address/${address}`;
  }
  getBlockExplorerUrlForTxHash(hash) {
    return this.chainConfig.blockExplorerUrl + `#/tx/${hash}`;
  }
}
//# sourceMappingURL=TerraChain.js.map
