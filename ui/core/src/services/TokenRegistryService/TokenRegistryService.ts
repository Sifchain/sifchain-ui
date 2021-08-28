import { Chain, Network, getChainsService, IAsset } from "../../entities";
import { RegistryEntry } from "../../generated/proto/sifnode/tokenregistry/v1/types";
import { NativeDexClient } from "../utils/SifClient/NativeDexClient";

export type TokenRegistryContext = {
  sifRpcUrl: string;
};

let tokenRegistry: RegistryEntry[];
export const TokenRegistryService = (context: TokenRegistryContext) => {
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

  const self = {
    load: () => loadTokenRegistry(),
    findAssetEntry: async (asset: IAsset) => {
      const items = await loadTokenRegistry();
      return items.find((item) => item.baseDenom === asset.symbol);
    },
    findAssetEntryOrThrow: async (asset: IAsset) => {
      const entry = await self.findAssetEntry(asset);
      if (!entry)
        throw new Error("TokenRegistry entry not found for " + asset.symbol);
      return entry;
    },
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
  return self;
};

export default TokenRegistryService;
