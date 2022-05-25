import { urlJoin } from "url-join-ts";

import { Chain } from "../../entities";
import { BaseChain } from "./_BaseChain";

export class GravityChain extends BaseChain implements Chain {
  getBlockExplorerUrlForTxHash(hash: string) {
    return urlJoin(this.chainConfig.blockExplorerUrl, "tx", hash);
  }
  getBlockExplorerUrlForAddress(hash: string) {
    return urlJoin(this.chainConfig.blockExplorerUrl, "account", hash);
  }
}
