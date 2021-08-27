import { Chain, Network, IAssetAmount } from "../../entities";
import { urlJoin } from "url-join-ts";
import { calculateIBCExportFee } from "../../utils/ibcExportFees";
import { BaseChain } from "./_BaseChain";

export class SentinelChain extends BaseChain implements Chain {
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
