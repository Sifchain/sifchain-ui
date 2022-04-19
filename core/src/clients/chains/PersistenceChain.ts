import { urlJoin } from "url-join-ts";

import { Chain } from "../../entities";
import { BaseChain } from "./_BaseChain";

export class PersistenceChain extends BaseChain implements Chain {
  getBlockExplorerUrlForTxHash(hash: string) {
    return urlJoin(this.chainConfig.blockExplorerUrl, "transactions", hash);
  }
  getBlockExplorerUrlForAddress(address: string) {
    return urlJoin(this.chainConfig.blockExplorerUrl, "wallet", address);
  }
}
