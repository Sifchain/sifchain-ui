import { useChains } from "~/hooks/useChains";
import { Network } from "@sifchain/sdk";
import { TokenRegistry } from "@sifchain/sdk/src/clients/native/TokenRegistry";

export default class TokenRegistryService extends TokenRegistry {
  async loadConnectionByNetworks(params: {
    sourceNetwork: Network;
    destinationNetwork: Network;
  }) {
    return this.loadConnection({
      fromChain: useChains().get(params.sourceNetwork),
      toChain: useChains().get(params.destinationNetwork),
    });
  }
}
