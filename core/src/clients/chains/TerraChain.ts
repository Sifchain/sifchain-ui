import { urlJoin } from "url-join-ts";
import { Chain } from "../../entities";
import { BaseChain } from "./_BaseChain";

export class TerraChain extends BaseChain implements Chain {
  getBlockExplorerUrlForAddress(address: string) {
    return urlJoin(this.chainConfig.blockExplorerUrl, "address", address);
  }
  getBlockExplorerUrlForTxHash(hash: string) {
    return urlJoin(this.chainConfig.blockExplorerUrl, "tx", hash);
  }
}
