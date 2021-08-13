import { UsecaseContext } from "..";
import { IAssetAmount, Chain, Network } from "../../entities";

import createEthereumSifchain from "./ethereumSifchain";
import {
  EthereumChain,
  SifchainChain,
} from "../../services/ChainsService/chains";
import { InterchainApi } from "./_InterchainApi";
// import ethereumToSifchain from "./ethereumToSifchain";
// import sifchainToethereum from "./sifchainToethereum";
// import sifchainToEthereum from "./sifchainToEthereum";

export default function InterchainUsecase(context: UsecaseContext) {
  const chains = context.services.chains;
  const ethereumSifchain = createEthereumSifchain(
    context,
    chains.ethereum,
    chains.sifchain,
  );
  return (from: Chain, to: Chain): InterchainApi => {
    if (from instanceof EthereumChain && to instanceof SifchainChain) {
      return ethereumSifchain;
    } else {
      throw new Error(
        `Token transfer from chain ${from.id} to chain ${to.id} not supported!`,
      );
    }
  };
}
