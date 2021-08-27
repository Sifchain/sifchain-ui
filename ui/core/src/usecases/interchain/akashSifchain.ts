import { UsecaseContext } from "..";
import { CosmoshubSifchainInterchainApi } from "./cosmoshubSifchain";
import { Network } from "../../entities";

export default function createAkashChainSifchainApi(context: UsecaseContext) {
  return new CosmoshubSifchainInterchainApi(
    context,
    context.services.chains.get(Network.AKASH),
    context.services.chains.get(Network.SIFCHAIN),
  );
}
