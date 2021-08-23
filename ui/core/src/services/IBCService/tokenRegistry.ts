import { Chain, Network, getChainsService } from "../../entities";
import { NativeDexClient } from "../../services/utils/SifClient/NativeDexClient";
import { RegistryEntry } from "../../generated/proto/sifnode/tokenregistry/v1/types";

export const TokenRegistry = (context: { sifRpcUrl: string }) => {
  let tokenRegistry: RegistryEntry[];
  const loadTokenRegistry = async () => {
    if (!tokenRegistry) {
      const dex = await NativeDexClient.connect(context.sifRpcUrl);
      const res = await dex.query?.tokenregistry.Entries({});
      const data = res?.registry?.entries;
      if (!data) throw new Error("Whitelist not found");
      tokenRegistry = data as RegistryEntry[];
    }
    return tokenRegistry;
  };

  return {
    load: () => loadTokenRegistry(),
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

      const counterpartyChain = sourceIsNative
        ? params.destinationChain
        : params.sourceChain;

      const item = items
        .reverse()
        .find(
          (item) =>
            item.baseDenom?.toLowerCase() ===
            counterpartyChain.nativeAsset.symbol.toLowerCase(),
        );

      // console.log("loadConnection", {
      //   ...params,
      //   counterpartyWhitelistItem: item,
      // });

      if (sourceIsNative) {
        return { channelId: item?.ibcChannelId };
      } else {
        return { channelId: item?.ibcCounterpartyChannelId };
      }
    },
  };
};
