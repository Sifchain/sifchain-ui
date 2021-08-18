import { UsecaseContext } from "..";
import { SifchainChain, IrisChain } from "../../services/ChainsService";
import { SifchainCosmoshubInterchainApi } from "./sifchainCosmoshub";
import { Network } from "../../entities";

export default function createSifchainIrisApi(context: UsecaseContext) {
  return new SifchainCosmoshubInterchainApi(
    context,
    context.services.chains.get(Network.SIFCHAIN),
    context.services.chains.get(Network.IRIS),
  );
}
