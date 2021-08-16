import { UsecaseContext } from "..";
import { SifchainChain, IrisChain } from "../../services/ChainsService";
import { CosmoshubSifchainInterchainApi } from "./cosmoshubSifchain";

export default function createIrisChainSifchainApi(
  context: UsecaseContext,
  irisChain: IrisChain,
  sifchainChain: SifchainChain,
) {
  return new CosmoshubSifchainInterchainApi(context, irisChain, sifchainChain);
}
