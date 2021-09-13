import { TokenRegistryService } from "../../services/TokenRegistryService";
import { RegistryEntry } from "../../generated/proto/sifnode/tokenregistry/v1/types";
import Long from "long";
import { Network } from "../../entities";
import { chainConfigsByChainId } from "../../config/chains";
import { assetMetadataLookup } from "./assetMetadata";

export const getRegistryEntryHomeNetwork = (entry: RegistryEntry) => {
  if (entry.baseDenom === "rowan") {
    return Network.SIFCHAIN;
  } else if (entry.ibcCounterpartyChainId) {
    const chainConfig = chainConfigsByChainId[entry.ibcCounterpartyChainId];
    return chainConfig?.network;
  } else {
    return Network.ETHEREUM;
  }
};

export const loadSanitizedRegistryEntries = async (params: {
  sifRpcUrl: string;
}) => {
  const tokenRegistry = TokenRegistryService(params);
  const entries = await tokenRegistry.load();
  const entriesLookup: Record<string, RegistryEntry> = {};

  entries.forEach((entry) => {
    const homeNetwork = getRegistryEntryHomeNetwork(entry);
    if (!homeNetwork) {
      console.log("skip", entry.baseDenom, "unknown chain");
      return false;
    }
    if (!assetMetadataLookup[entry.baseDenom]) {
      console.log(
        "skip",
        entry.baseDenom,
        "baseDenom not found in assetMetadata",
      );
      return false;
    }
    entriesLookup[entry.baseDenom] = entry;
  });
  // Get rid of duplicates in bad registry data...
  return Object.values(entriesLookup);
};

export function symbolWithoutPrefix(symbol: string) {
  return symbol.toLowerCase().replace(/^(c|e|u|x)/, "");
}
