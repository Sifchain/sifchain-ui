import { Chain, Network, IAssetAmount } from "../../entities";
import { urlJoin } from "url-join-ts";
import { BaseChain } from "./_BaseChain";
import { calculateIBCExportFee } from "../utils";

export class AkashChain extends BaseChain implements Chain {
  getBlockExplorerUrlForTxHash(hash: string) {
    return urlJoin(this.chainConfig.blockExplorerUrl, "txs", hash);
  }

  calculateTransferFeeToChain(transferAmount: IAssetAmount) {
    return calculateIBCExportFee(transferAmount);
  }
}
