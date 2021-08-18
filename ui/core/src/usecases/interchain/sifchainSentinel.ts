import { UsecaseContext } from "..";
import { SifchainCosmoshubInterchainApi } from "./sifchainCosmoshub";
import { Network } from "../../entities";

export default function createSifchainSentinelApi(context: UsecaseContext) {
  return new SifchainCosmoshubInterchainApi(
    context,
    context.services.chains.get(Network.SIFCHAIN),
    context.services.chains.get(Network.SENTINEL),
  );
}
