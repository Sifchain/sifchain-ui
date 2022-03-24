import { isLikeSymbol } from "../../utils/isLikeSymbol";
import { urlJoin } from "url-join-ts";
export class BaseChain {
    constructor(context) {
        this.context = context;
        this.chainConfig = context.chainConfig;
        this.assets = context.assets.filter((a) => a.network === context.chainConfig.network);
        this.assetMap = new Map();
        this.assets.forEach((asset) => {
            this.assetMap.set(asset.symbol.toLowerCase(), asset);
        });
        this.nativeAsset = this.assets.find((a) => a.symbol === context.chainConfig.nativeAssetSymbol);
    }
    get network() {
        return this.chainConfig.network;
    }
    get displayName() {
        return this.chainConfig.displayName;
    }
    lookupAsset(symbol) {
        return this.assetMap.get(symbol.toLowerCase());
    }
    lookupAssetOrThrow(symbol) {
        const asset = this.lookupAsset(symbol);
        if (!asset) {
            throw new Error(`Asset with symbol ${symbol} not found in chain ${this.displayName}`);
        }
        return asset;
    }
    findAssetWithLikeSymbol(symbol) {
        return this.assets.find((asset) => isLikeSymbol(asset.symbol, symbol));
    }
    findAssetWithLikeSymbolOrThrow(symbol) {
        const asset = this.assets.find((asset) => isLikeSymbol(asset.symbol, symbol));
        if (!asset)
            throw new Error(`Asset ${symbol} not found in chain ${this.displayName}`);
        return asset;
    }
    getBlockExplorerUrlForTxHash(hash) {
        return urlJoin(this.chainConfig.blockExplorerUrl, "transactions", hash);
    }
    getBlockExplorerUrlForAddress(address) {
        return urlJoin(this.chainConfig.blockExplorerUrl, "accounts", address);
    }
    forceGetAsset(symbol) {
        return (this.lookupAsset(symbol) || this.findAssetWithLikeSymbolOrThrow(symbol));
    }
}
//# sourceMappingURL=_BaseChain.js.map