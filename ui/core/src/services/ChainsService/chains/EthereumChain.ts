import { Chain, Network } from "../../../entities";
import { BaseChain } from "./BaseChain";

export class EthereumChain extends BaseChain implements Chain {
  getBlockExplorerUrlForAddress(address: string) {
    return `${this.chainConfig.blockExplorerUrl}/address/${address}`;
  }
}
