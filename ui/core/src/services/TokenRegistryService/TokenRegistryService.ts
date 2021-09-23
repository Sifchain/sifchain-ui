import { Chain, Network, getChainsService, IAsset } from "../../entities";
import { RegistryEntry } from "../../generated/proto/sifnode/tokenregistry/v1/types";
import { NativeDexClient } from "../utils/SifClient/NativeDexClient";

export type TokenRegistryContext = {
  sifRpcUrl: string;
  sifApiUrl: string;
  sifChainId: string;
};

let tokenRegistryPromise: Promise<RegistryEntry[]>;
export const TokenRegistryService = (context: TokenRegistryContext) => {
  const loadTokenRegistry = async () => {
    if (!tokenRegistryPromise) {
      tokenRegistryPromise = (async () => {
        const dex = await NativeDexClient.connect(
          context.sifRpcUrl,
          context.sifApiUrl,
          context.sifChainId,
        );
        const res = await dex.query?.tokenregistry.Entries({});
        const data = res?.registry?.entries;
        if (!data) throw new Error("Whitelist not found");
        return data as RegistryEntry[];
      })();
    }
    return tokenRegistryPromise;
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
        fromChain: getChainsService().get(params.sourceNetwork),
        toChain: getChainsService().get(params.destinationNetwork),
      });
    },
    async loadConnection(params: { fromChain: Chain; toChain: Chain }) {
      const items = await loadTokenRegistry();

      const sourceIsNative = params.fromChain.network === Network.SIFCHAIN;

      const counterpartyChain = sourceIsNative
        ? params.toChain
        : params.fromChain;

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
