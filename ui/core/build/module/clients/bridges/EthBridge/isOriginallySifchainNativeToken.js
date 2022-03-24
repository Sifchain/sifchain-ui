import { Network } from "../../../entities";
export function isOriginallySifchainNativeToken(asset) {
    return (asset.homeNetwork !== Network.ETHEREUM ||
        asset.symbol.toLowerCase() === "erowan");
}
//# sourceMappingURL=isOriginallySifchainNativeToken.js.map