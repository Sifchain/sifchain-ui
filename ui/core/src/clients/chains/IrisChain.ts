import { Chain, Network } from "../../entities";
import { BaseChain } from "./BaseChain";
import { urlJoin } from "url-join-ts";

export class IrisChain extends BaseChain implements Chain {
  getBlockExplorerUrlForAddress(address: string) {
    return this.chainConfig.blockExplorerUrl + `#/address/${address}`;
  }
  getBlockExplorerUrlForTxHash(hash: string) {
    return this.chainConfig.blockExplorerUrl + `#/tx?txHash=${hash}`;
  }
}
