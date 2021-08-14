import { UsecaseContext } from "..";
import { IAssetAmount, Chain, Network } from "../../entities";

import EthereumSifchain from "./ethereumSifchain";
import CosmoshubSifchain from "./cosmoshubSifchain";
import SifchainEthereum from "./sifchainEthereum";
import SifchainCosmoshub from "./sifchainEthereum";

import {
  EthereumChain,
  SifchainChain,
  CosmoshubChain,
} from "../../services/ChainsService/chains";

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
  const sifchainEthereum = SifchainEthereum(
    context,
    chains.cosmoshub,
    chains.sifchain,
  );
  const sifchainCosmoshub = SifchainCosmoshub(
    context,
    chains.cosmoshub,
    chains.sifchain,
  );
  return (from: Chain, to: Chain) => {
    if (from instanceof EthereumChain && to instanceof SifchainChain) {
      return ethereumSifchain;
    } else if (from instanceof CosmoshubChain && to instanceof SifchainChain) {
      return cosmoshubSifchain;
    } else if (from instanceof SifchainChain && to instanceof EthereumChain) {
      return sifchainEthereum;
    } else if (from instanceof SifchainChain && to instanceof CosmoshubChain) {
      return sifchainCosmoshub;
    } else {
      throw new Error(
        `Token transfer from chain ${from.id} to chain ${to.id} not supported!`,
      );
    }
  };
}
