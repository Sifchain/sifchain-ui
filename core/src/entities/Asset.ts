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
  decommissioned?: true;
  decommissionReason?: string;
};
type ReadonlyAsset = Readonly<IAsset>;
const assetMap = new Map<string, ReadonlyAsset>();

function isAsset(value: any): value is IAsset {
  return (
    typeof value?.symbol === "string" && typeof value?.decimals === "number"
  );
}

export const Asset = Object.assign(
  (assetOrSymbol: IAsset | string): ReadonlyAsset => {
    // If it is an asset then cache it and return it
    if (isAsset(assetOrSymbol)) {
      const key = assetOrSymbol.symbol.toLowerCase();

      // prevent overriding of existing rowan asset
      if (assetMap.has(key) && key === "rowan") {
        return assetOrSymbol;
      }

      assetMap.set(key, {
        ...assetOrSymbol,
        displaySymbol: assetOrSymbol.displaySymbol || assetOrSymbol.symbol,
      });

      return assetOrSymbol;
    }

    // Return it from cache
    const found = assetOrSymbol
      ? assetMap.get(assetOrSymbol.toLowerCase())
      : false;

    if (!found) {
      throw new Error(
        `Attempt to retrieve the asset with key "${assetOrSymbol}" before it had been cached.`,
      );
    }

    return found;
  },
  {
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
     */
    get: (symbol: string) => {
      return Asset(symbol);
    },
  },
);
