import {
  Chain,
  Network,
  getChainsService,
  IAssetAmount,
  AssetAmount,
} from "../../entities";
import { BaseChain } from "./_BaseChain";
import { urlJoin } from "url-join-ts";
import { isOriginallySifchainNativeToken } from "../../usecases/peg/utils/isOriginallySifchainNativeToken";

export class EthereumChain extends BaseChain implements Chain {
  getBlockExplorerUrlForTxHash(hash: string) {
    return urlJoin(this.chainConfig.blockExplorerUrl, "tx", hash);
  }
  getBlockExplorerUrlForAddress(address: string) {
    return urlJoin(this.chainConfig.blockExplorerUrl, "address", address);
  }

  calculateTransferFeeToChain(transferAmount: IAssetAmount) {
    const ceth = getChainsService()
      .get(Network.SIFCHAIN)
      .findAssetWithLikeSymbolOrThrow("ceth");

    const feeNumber = isOriginallySifchainNativeToken(transferAmount.asset)
      ? "35370000000000000"
      : "35370000000000000";

    return AssetAmount(ceth, feeNumber);
  }
}
