import { UsecaseContext } from "..";
import { IAssetAmount, Chain, Network } from "../../entities";

import EthereumSifchain from "./ethereumSifchain";
import CosmoshubSifchain from "./cosmoshubSifchain";
import {
  EthereumChain,
  SifchainChain,
  CosmoshubChain,
} from "../../services/ChainsService/chains";
import { InterchainApi } from "./_InterchainApi";
// import sifchainToethereum from "./sifchainToethereum";
// import sifchainToEthereum from "./sifchainToEthereum";

export default function InterchainUsecase(context: UsecaseContext) {
  const chains = context.services.chains;
  const ethereumSifchain = EthereumSifchain(
    context,
    chains.ethereum,
    chains.sifchain,
  );
  const cosmoshubSifchain = CosmoshubSifchain(
    context,
    chains.cosmoshub,
    chains.sifchain,
  );
  return (from: Chain, to: Chain): InterchainApi => {
    if (from instanceof EthereumChain && to instanceof SifchainChain) {
      return ethereumSifchain;
    } else if (from instanceof CosmoshubChain && to instanceof SifchainChain) {
      return cosmoshubSifchain;
    } else {
      throw new Error(
        `Token transfer from chain ${from.id} to chain ${to.id} not supported!`,
      );
    }
  };
}
