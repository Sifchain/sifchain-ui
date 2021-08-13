import { Chain, Network } from "../../../entities";
import { BaseChain } from "./BaseChain";

export class CosmoshubChain extends BaseChain implements Chain {
  static id = "cosmoshub";
  id = "cosmoshub";
  displayName = "Cosmoshub";
  network = Network.COSMOSHUB;

  getBlockExplorerUrlForTxHash(hash: string) {
    return `${this.blockExplorerUrl}/tx/${hash}`;
  }
}
