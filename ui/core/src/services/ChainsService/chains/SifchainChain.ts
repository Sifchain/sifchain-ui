import { Chain, Network } from "../../../entities";
import { BaseChain } from "./BaseChain";

export class SifchainChain extends BaseChain implements Chain {
  getBlockExplorerUrlForTxHash(hash: string) {
    return `${this.chainConfig.blockExplorerUrl}/transaction/${hash}`;
  }
}
