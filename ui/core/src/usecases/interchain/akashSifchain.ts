import { UsecaseContext } from "..";
import { SifchainChain, IrisChain } from "../../services/ChainsService";
import { CosmoshubSifchainInterchainApi } from "./cosmoshubSifchain";
import { Network } from "../../entities";

export default function createIrisChainSifchainApi(context: UsecaseContext) {
  return new CosmoshubSifchainInterchainApi(
    context,
    context.services.chains.get(Network.AKASH),
    context.services.chains.get(Network.SIFCHAIN),
  );
}
