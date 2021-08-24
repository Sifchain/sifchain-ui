import { Chain, Network, IAssetAmount } from "../../entities";
import { urlJoin } from "url-join-ts";
import { CosmoshubChain } from "./CosmoshubChain";
import { calculateIBCExportFee } from "../../utils/ibcExportFees";

export class SentinelChain extends CosmoshubChain implements Chain {
  getBlockExplorerUrlForTxHash(hash: string) {
    return urlJoin(this.chainConfig.blockExplorerUrl, "transactions", hash);
  }
  getBlockExplorerUrlForAddress(address: string) {
    return urlJoin(this.chainConfig.blockExplorerUrl, "accounts", address);
  }
  calculateTransferFeeToChain(transferAmount: IAssetAmount) {
    return calculateIBCExportFee(transferAmount);
  }
}
