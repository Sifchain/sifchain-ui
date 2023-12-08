import { urlJoin } from "url-join-ts";

import { Chain, IAssetAmount } from "../../entities";
import { BaseChain } from "./_BaseChain";

export class NobleChain extends BaseChain implements Chain {
  getBlockExplorerUrlForTxHash(hash: string) {
    return urlJoin(this.chainConfig.blockExplorerUrl, "txs", hash);
  }
  getBlockExplorerUrlForAddress(hash: string) {
    return urlJoin(this.chainConfig.blockExplorerUrl, "account", hash);
  }
}
