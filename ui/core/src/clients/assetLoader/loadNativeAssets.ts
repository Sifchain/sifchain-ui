import {
  loadSanitizedRegistryEntries,
  symbolWithoutPrefix,
  getRegistryEntryHomeNetwork,
} from "./utils";
import { IAsset, Network } from "../../entities";
import { chainConfigsByChainId } from "../../config/chains";
import { assetMetadataLookup } from "./assetMetadata";
import { RegistryEntry } from "../../generated/proto/sifnode/tokenregistry/v1/types";

export type NativeAssetLoadParams = { sifRpcUrl: string };

export default async function loadNativeAssets(params: NativeAssetLoadParams) {
  const entries = await loadSanitizedRegistryEntries(params);
  return entries.map(mapRegistryEntryToNativeAsset);
}

export function mapRegistryEntryToNativeAsset(entry: RegistryEntry): IAsset {
  const homeNetwork = getRegistryEntryHomeNetwork(entry);

  const displaySymbol =
    entry.displaySymbol || symbolWithoutPrefix(entry.baseDenom);

  return {
    decimals: entry.decimals.toNumber(),
    symbol: entry.baseDenom,
    displaySymbol,
    name: entry.displayName || displaySymbol,
    label: entry.displayName || displaySymbol,
    network: Network.SIFCHAIN,
    homeNetwork,
    ibcDenom: entry.ibcCounterpartyChainId ? entry.denom : undefined,
    ...assetMetadataLookup[entry.baseDenom],
  };
}
