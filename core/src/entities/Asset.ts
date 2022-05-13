import { Network } from "./Network";

export type IAsset = {
  address?: string;
  decimals: number;
  imageUrl?: string;
  name: string;
  network: Network;
  symbol: string;
  unitDenom?: string;
  ibcDenom?: string;
  displaySymbol: string;
  lowercasePrefixLength?: number;
  label?: string;
  hasDarkIcon?: boolean;
  homeNetwork: Network;
  decommissioned?: boolean;
  decommissionReason?: string;
};

type ReadonlyAsset = Readonly<IAsset>;

const ASSET_MAP_STORAGE_KEY = "@@assetMap";

function isAsset(value: any): value is IAsset {
  return (
    typeof value?.symbol === "string" && typeof value?.decimals === "number"
  );
}

/**
 * @deprecated should only use as factory and not as throwable cache lookup
 */
function _Asset(symbol: string): ReadonlyAsset;

function _Asset(asset: IAsset): ReadonlyAsset;
function _Asset(assetOrSymbol: IAsset | string): ReadonlyAsset;
function _Asset(assetOrSymbol: any): ReadonlyAsset {
  const rawMapString = sessionStorage.getItem(ASSET_MAP_STORAGE_KEY);
  const assetMap = JSON.parse(rawMapString ?? JSON.stringify({})) as Record<
    string,
    ReadonlyAsset
  >;

  // If it is an asset then cache it and return it
  if (isAsset(assetOrSymbol)) {
    const key = assetOrSymbol.symbol.toLowerCase();

    // prevent overriding of existing rowan asset
    if (key in assetMap && key === "rowan") {
      return assetOrSymbol;
    }

    assetMap[key] = {
      ...assetOrSymbol,
      displaySymbol: assetOrSymbol.displaySymbol || assetOrSymbol.symbol,
    };

    sessionStorage.setItem(ASSET_MAP_STORAGE_KEY, JSON.stringify(assetMap));

    return assetOrSymbol;
  }

  // Return it from cache
  const found = assetOrSymbol ? assetMap[assetOrSymbol.toLowerCase()] : false;

  if (!found) {
    throw new Error(
      `Attempt to retrieve the asset with key "${assetOrSymbol}" before it had been cached.`,
    );
  }

  return found;
}

export const Asset = Object.assign(_Asset, {
  /**
   * @deprecated caching should happen at network layer
   */
  set: (symbol: string, asset: IAsset) => {
    Asset(asset); // assuming symbol is same,
  },
  /**
   * A quick way to look up an asset by symbol.
   * Pass in a string, and it will attempt to look up the asset and return it. Throws an error if the asset is not found.
   *
   * Pass in an IAsset, and it will save it for future lookups.
   *
   * @remarks This lookup is only a shortcut and does not allow you to lookup an asset by chain. For that, use Chain#lookupAsset.
   * @deprecated should only use as factory and not as throwable cache lookup
   */
  get: (symbol: string) => {
    return Asset(symbol);
  },
});
