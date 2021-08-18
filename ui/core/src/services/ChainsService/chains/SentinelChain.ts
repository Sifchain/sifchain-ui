import { Chain, Network } from "../../../entities";
import { BaseChain } from "./BaseChain";

export class SentinelChain extends BaseChain implements Chain {
  id = "sentinel";
  displayName = "sentinel";
  network = Network.SENTINEL;

  getBlockExplorerUrlForTxHash(hash: string) {
    return `${this.blockExplorerUrl}/tx/${hash}`;
  }
}
