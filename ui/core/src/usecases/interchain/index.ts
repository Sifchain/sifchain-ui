import { UsecaseContext } from "..";
import { IAssetAmount, Chain, Network } from "../../entities";
import EthereumSifchain from "./ethereumSifchain";
import CosmoshubSifchain from "./cosmoshubSifchain";
import SifchainEthereum from "./sifchainEthereum";
import SifchainCosmoshub from "./sifchainCosmoshub";
import IrisSifchain from "./irisSifchain";
import SifchainIris from "./sifchainIris";
import AkashSifchain from "./akashSifchain";
import SifchainAkash from "./sifchainAkash";
import {
  EthereumChain,
  SifchainChain,
  CosmoshubChain,
  IrisChain,
  AkashChain,
} from "../../services/ChainsService/chains";

export default function InterchainUsecase(context: UsecaseContext) {
  /* 
    Please do not copy & paste these when setting up the inverse 
    of an interchain.
    i.e. `const sifchainIris = IrisSifchain(context);`
  */
  const chains = context.services.chains;
  const ethereumSifchain = EthereumSifchain(context);
  const cosmoshubSifchain = CosmoshubSifchain(context);
  const irisSifchain = IrisSifchain(context);
  const akashSifchain = AkashSifchain(context);
  const sifchainEthereum = SifchainEthereum(context);
  const sifchainCosmoshub = SifchainCosmoshub(context);
  const sifchainIris = SifchainIris(context);
  const sifchainAkash = SifchainAkash(context);

  return (from: Chain, to: Chain) => {
    if (from instanceof EthereumChain && to instanceof SifchainChain) {
      return ethereumSifchain;
    } else if (from instanceof CosmoshubChain && to instanceof SifchainChain) {
      return cosmoshubSifchain;
    } else if (from instanceof IrisChain && to instanceof SifchainChain) {
      return irisSifchain;
    } else if (from instanceof AkashChain && to instanceof SifchainChain) {
      return akashSifchain;
    } else if (from instanceof SifchainChain && to instanceof EthereumChain) {
      return sifchainEthereum;
    } else if (from instanceof SifchainChain && to instanceof CosmoshubChain) {
      return sifchainCosmoshub;
    } else if (from instanceof SifchainChain && to instanceof IrisChain) {
      return sifchainIris;
    } else if (from instanceof SifchainChain && to instanceof AkashChain) {
      return sifchainAkash;
    } else {
      throw new Error(
        `Token transfer from chain ${from.id} to chain ${to.id} not supported!`,
      );
    }
  };
}
