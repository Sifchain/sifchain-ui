import { IAssetAmount, TransactionStatus, IAsset } from "../../entities";
import { AnyChain } from "../../services/ChainsService";

export type InterchainApi = {
  prepareTransfer(assetAmount: IAssetAmount): Promise<ChainTransferDraft>;
};

export type ChainTransferDraft = {
  fee?: IAssetAmount;
  assetAmount: IAssetAmount;
  targetAsset: IAsset | undefined;
  execute: () => AsyncGenerator<ChainTransferEvent>;
};

export type ChainTransferEvent = {
  type: string;
  tx?: TransactionStatus;
};
