import { UsecaseContext } from "..";
import { CosmoshubSifchainInterchainApi } from "./cosmoshubSifchain";
import { Network } from "../../entities";

export default function createSentinelChainSifchainApi(
  context: UsecaseContext,
) {
  return new CosmoshubSifchainInterchainApi(
    context,
    context.services.chains.get(Network.SENTINEL),
    context.services.chains.get(Network.SIFCHAIN),
  );
}
