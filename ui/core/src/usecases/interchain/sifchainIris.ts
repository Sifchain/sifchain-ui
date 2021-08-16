import { UsecaseContext } from "..";
import { SifchainChain, IrisChain } from "../../services/ChainsService";
import { SifchainCosmoshubInterchainApi } from "./sifchainCosmoshub";

export default function createSifchainIrisApi(
  context: UsecaseContext,
  fromChain: SifchainChain,
  toChain: IrisChain,
) {
  return new SifchainCosmoshubInterchainApi(context, fromChain, toChain);
}
