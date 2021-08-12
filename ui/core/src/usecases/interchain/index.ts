import { UsecaseContext } from "..";
import { IAssetAmount, Chain, Network } from "../../entities";

import EthereumSifchain from "./ethereumSifchain";
import {
  EthereumChain,
  SifchainChain,
} from "../../services/ChainsService/chains";
// import ethereumToSifchain from "./ethereumToSifchain";
// import sifchainToethereum from "./sifchainToethereum";
// import sifchainToEthereum from "./sifchainToEthereum";

export default function InterchainUsecase(context: UsecaseContext) {
  const ethereumInterchain = EthereumSifchain(context);
  return (from: Chain, to: Chain) => {
    if (from instanceof EthereumChain && to instanceof SifchainChain) {
      return ethereumInterchain(from, to);
    } else {
      throw new Error(
        `Token transfer from chain ${from.id} to chain ${to.id} not supported!`,
      );
    }
  };
}
