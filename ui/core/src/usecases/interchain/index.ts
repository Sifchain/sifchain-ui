import { UsecaseContext } from "..";
import { IAssetAmount, Chain, Network } from "../../entities";

import EthereumSifchain from "./ethereumSifchain";
import CosmoshubSifchain from "./cosmoshubSifchain";
import SifchainEthereum from "./sifchainEthereum";
import SifchainCosmoshub from "./sifchainCosmoshub";
import IrisSifchain from "./irisSifchain";

import {
  EthereumChain,
  SifchainChain,
  CosmoshubChain,
  IrisChain,
} from "../../services/ChainsService/chains";

export default function InterchainUsecase(context: UsecaseContext) {
  const chains = context.services.chains;
  const ethereumSifchain = EthereumSifchain(context);
  const cosmoshubSifchain = CosmoshubSifchain(context);
  const irisSifchain = IrisSifchain(context);
  const sifchainEthereum = SifchainEthereum(context);
  const sifchainCosmoshub = SifchainCosmoshub(context);
  const sifchainIris = IrisSifchain(context);

  return (from: Chain, to: Chain) => {
    if (from instanceof EthereumChain && to instanceof SifchainChain) {
      return ethereumSifchain;
    } else if (from instanceof CosmoshubChain && to instanceof SifchainChain) {
      return cosmoshubSifchain;
    } else if (from instanceof IrisChain && to instanceof SifchainChain) {
      return irisSifchain;
    } else if (from instanceof SifchainChain && to instanceof EthereumChain) {
      return sifchainEthereum;
    } else if (from instanceof SifchainChain && to instanceof CosmoshubChain) {
      return sifchainCosmoshub;
    } else if (from instanceof SifchainChain && to instanceof IrisChain) {
      return sifchainIris;
    } else {
      throw new Error(
        `Token transfer from chain ${from.id} to chain ${to.id} not supported!`,
      );
    }
  };
}
