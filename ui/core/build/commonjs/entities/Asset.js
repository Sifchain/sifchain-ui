"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Asset = void 0;
const assetMap = new Map();
function isAsset(value) {
    return (typeof (value === null || value === void 0 ? void 0 : value.symbol) === "string" && typeof (value === null || value === void 0 ? void 0 : value.decimals) === "number");
}
function Asset(assetOrSymbol) {
    // If it is an asset then cache it and return it
    if (isAsset(assetOrSymbol)) {
        const key = assetOrSymbol.symbol.toLowerCase();
        // prevent overriding of existing rowan asset
        if (assetMap.has(key) && key === "rowan") {
            return assetOrSymbol;
        }
        assetMap.set(key, Object.assign(Object.assign({}, assetOrSymbol), { displaySymbol: assetOrSymbol.displaySymbol || assetOrSymbol.symbol }));
        return assetOrSymbol;
    }
    // Return it from cache
    const found = assetOrSymbol
        ? assetMap.get(assetOrSymbol.toLowerCase())
        : false;
    if (!found) {
        throw new Error(`Attempt to retrieve the asset with key "${assetOrSymbol}" before it had been cached.`);
    }
    return found;
}
exports.Asset = Asset;
/**
 * @ignore
 */
Asset.set = (symbol, asset) => {
    Asset(asset); // assuming symbol is same
};
/**
 * A quick way to look up an asset by symbol.
 * Pass in a string, and it will attempt to look up the asset and return it. Throws an error if the asset is not found.
 *
 * Pass in an IAsset, and it will save it for future lookups.
 *
 * @remarks This lookup is only a shortcut and does not allow you to lookup an asset by chain. For that, use Chain#lookupAsset.
 */
Asset.get = (symbol) => {
    return Asset(symbol);
};
//# sourceMappingURL=Asset.js.map