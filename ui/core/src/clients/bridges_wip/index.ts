import { UsecaseContext } from "..";
import { IAssetAmount, Chain, Network } from "../../entities";
import {
  EthereumChain,
  SifchainChain,
  CosmoshubChain,
  IrisChain,
  AkashChain,
  SentinelChain,
} from "../../clients/chains";
import InterchainTxManager from "./txManager";
import { SifchainCosmosInterchainApi } from "./sifchainCosmosInterchain";
import { EthereumSifchainInterchainApi } from "./ethereumSifchainInterchain";
import { CosmosSifchainInterchainApi } from "./cosmosSifchainInterchain";
import { SifchainEthereumInterchainApi } from "./sifchainEthereumInterchain";

export default function InterchainUsecase(context: UsecaseContext) {
  const sifchainEthereum = new SifchainEthereumInterchainApi(context);
  const sifchainCosmos = new SifchainCosmosInterchainApi(context);
  const ethereumSifchain = new EthereumSifchainInterchainApi(context);
  const cosmosSifchain = new CosmosSifchainInterchainApi(context);

  const interchain = (from: Chain, to: Chain) => {
    if (from instanceof SifchainChain) {
      if (to.chainConfig.chainType === "ibc") {
        return sifchainCosmos;
      } else if (to.chainConfig.chainType === "eth") {
        return sifchainEthereum;
      }
    } else if (to instanceof SifchainChain) {
      if (from.chainConfig.chainType === "ibc") {
        return cosmosSifchain;
      } else if (from.chainConfig.chainType === "eth") {
        return ethereumSifchain;
      }
    }
    throw new Error(
      `Token transfer from chain ${from.network} to chain ${to.network} not supported!`,
    );
  };

  const txManager = InterchainTxManager(context, interchain);
  txManager.listenForSentTransfers();
  txManager.loadSavedTransferList();

  return interchain;
}
