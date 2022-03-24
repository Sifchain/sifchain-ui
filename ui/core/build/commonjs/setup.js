"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSdk = void 0;
const IBCBridge_1 = require("./clients/bridges/IBCBridge/IBCBridge");
const EthBridge_1 = require("./clients/bridges/EthBridge/EthBridge");
const liquidity_1 = require("./clients/liquidity");
const clients_1 = require("./clients");
const getSdkConfig_1 = require("./utils/getSdkConfig");
function createSdk(options) {
    const config = (0, getSdkConfig_1.getSdkConfig)(options);
    const chains = Object.fromEntries(Object.keys(clients_1.networkChainCtorLookup).map((network) => {
        const n = network;
        return [
            n,
            new clients_1.networkChainCtorLookup[n]({
                assets: config.assets,
                chainConfig: config.chainConfigsByNetwork[network],
            }),
        ];
    }));
    return {
        context: config,
        chains,
        bridges: {
            ibc: new IBCBridge_1.IBCBridge(config),
            eth: new EthBridge_1.EthBridge(config),
        },
        liquidity: new liquidity_1.LiquidityClient(config, chains.sifchain),
    };
}
exports.createSdk = createSdk;
//# sourceMappingURL=setup.js.map