import { Chain, Network } from "../../entities";
import { BaseChain } from "./BaseChain";
import { urlJoin } from "url-join-ts";

export class CosmoshubChain extends BaseChain implements Chain {
  getBlockExplorerUrlForTxHash(hash: string) {
    return urlJoin(this.chainConfig.blockExplorerUrl, "txs", hash);
  }
}
