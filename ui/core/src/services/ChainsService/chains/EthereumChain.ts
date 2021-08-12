import { Chain, Network } from "../../../entities";
import { BaseChain } from "./BaseChain";

export class EthereumChain extends BaseChain implements Chain {
  id = "ethereum";
  displayName = "Ethereum";
  network = Network.ETHEREUM;

  getBlockExplorerUrlForTxHash(hash: string) {
    return `${this.blockExplorerUrl}/tx/${hash}`;
  }
}
