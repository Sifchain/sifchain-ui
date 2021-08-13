import { Chain, Network } from "../../../entities";
import { BaseChain } from "./BaseChain";
import { SifchainChain } from "./SifchainChain";

export class EthereumChain extends BaseChain implements Chain {
  static id = "ethereum";
  id = "ethereum";
  displayName = "Ethereum";
  network = Network.ETHEREUM;

  getBlockExplorerUrlForTxHash(hash: string) {
    return `${this.blockExplorerUrl}/tx/${hash}`;
  }
}
