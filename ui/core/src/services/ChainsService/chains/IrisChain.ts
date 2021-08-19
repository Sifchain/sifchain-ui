import { Chain, Network } from "../../../entities";
import { BaseChain } from "./BaseChain";

export class IrisChain extends BaseChain implements Chain {
  id = "iris";
  displayName = "Iris";
  network = Network.IRIS;

  getBlockExplorerUrlForTxHash(hash: string) {
    return `${this.blockExplorerUrl}/tx/${hash}`;
  }
}
