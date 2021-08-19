import { IBCServiceContext } from "./IBCService";
import { Chain, Network, getChainsService } from "../../entities";

export type TokenRegistryItem = {
  is_whitelisted: boolean;
  decimals: string;
  denom?: string;
  base_denom?: string;
  path?: string;
  src_channel?: string;
  dest_channel?: string;
};

export const TokenRegistry = (context: IBCServiceContext) => {
  let tokenRegistry: TokenRegistryItem[];
  const loadTokenRegistry = async () => {
    if (!tokenRegistry) {
      const res = await fetch(`${context.sifApiUrl}/tokenregistry/entries`);
      if (!res.ok) {
        throw new Error("Issue loading token registry");
      }

      tokenRegistry = (await res.json()).result.registry
        .entries as TokenRegistryItem[];
    }
    return tokenRegistry;
  };

  return {
    async loadConnectionByNetworks(params: {
      sourceNetwork: Network;
      destinationNetwork: Network;
    }) {
      return this.loadConnection({
        sourceChain: getChainsService().get(params.sourceNetwork),
        destinationChain: getChainsService().get(params.destinationNetwork),
      });
    },
    async loadConnection(params: {
      sourceChain: Chain;
      destinationChain: Chain;
    }) {
      const items = await loadTokenRegistry();

      const sourceIsNative = params.sourceChain.network === Network.SIFCHAIN;

      const matchChain = sourceIsNative
        ? params.destinationChain
        : params.sourceChain;

      const item = items.find(
        (item) =>
          item.base_denom?.toLowerCase() ===
          matchChain.nativeAsset.symbol.toLowerCase(),
      );

      if (sourceIsNative) {
        return { channelId: item?.src_channel };
      } else {
        return { channelId: item?.dest_channel };
      }
    },
  };
};
