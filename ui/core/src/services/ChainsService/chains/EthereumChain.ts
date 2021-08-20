import { Chain, Network } from "../../../entities";
import { BaseChain } from "./BaseChain";
import { urlJoin } from "url-join-ts";

export class EthereumChain extends BaseChain implements Chain {
  getBlockExplorerUrlForTxHash(hash: string) {
    return urlJoin(this.chainConfig.blockExplorerUrl, "tx", hash);
  }
  getBlockExplorerUrlForAddress(address: string) {
    return urlJoin(this.chainConfig.blockExplorerUrl, "address", address);
  }
}
