import { Chain, Network } from "../../../entities";
import { BaseChain } from "./BaseChain";

export class AkashChain extends BaseChain implements Chain {
  id = "akash";
  displayName = "Akash";
  network = Network.AKASH;

  getBlockExplorerUrlForTxHash(hash: string) {
    return `${this.blockExplorerUrl}/tx/${hash}`;
  }
}
