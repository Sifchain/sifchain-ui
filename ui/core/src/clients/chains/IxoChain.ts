import { Chain, IAssetAmount } from "../../entities";
import { urlJoin } from "url-join-ts";
import { calculateIBCExportFee } from "../../utils/ibcExportFees";
import { BaseChain } from "./_BaseChain";

export class IxoChain extends BaseChain implements Chain {
  getBlockExplorerUrlForTxHash(hash: string) {
    return urlJoin(
      this.chainConfig.blockExplorerUrl,
      "/cosmos/tx/v1beta1/txs/",
      hash,
    );
  }
  getBlockExplorerUrlForAddress(address: string) {
    return urlJoin(
      this.chainConfig.blockExplorerUrl,
      "/cosmos/bank/v1beta1/balances/",
      address,
    );
  }
  calculateTransferFeeToChain(transferAmount: IAssetAmount) {
    return calculateIBCExportFee(transferAmount);
  }
}
