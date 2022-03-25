"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AKASH_TESTNET = void 0;
const entities_1 = require("../../../entities");
exports.AKASH_TESTNET = {
    network: entities_1.Network.AKASH,
    chainType: "ibc",
    displayName: "Akash",
    blockExplorerUrl: "https://testnet.akash.aneka.io",
    nativeAssetSymbol: "uakt",
    chainId: "akashsif-1",
    rpcUrl: "https://proxies.sifchain.finance/api/akashsif-1/rpc",
    restUrl: "https://proxies.sifchain.finance/api/akashsif-1/rest",
    keplrChainInfo: {
        rpc: "https://proxies.sifchain.finance/api/akashsif-1/rpc",
        rest: "https://proxies.sifchain.finance/api/akashsif-1/rest",
        chainId: "akashsif-1",
        chainName: "Akash Testnet (Sifchain)",
        stakeCurrency: {
            coinDenom: "AKT",
            coinMinimalDenom: "uakt",
            coinDecimals: 6,
            coinGeckoId: "akash-network",
        },
        walletUrl: "https://wallet.keplr.app/#/akash/stake",
        walletUrlForStaking: "https://wallet.keplr.app/#/akash/stake",
        bip44: {
            coinType: 118,
        },
        gasPriceStep: {
            low: 6250,
            average: 9375,
            high: 12500,
        },
        bech32Config: {
            bech32PrefixAccAddr: "akash",
            bech32PrefixAccPub: "akashpub",
            bech32PrefixValAddr: "akashvaloper",
            bech32PrefixValPub: "akashvaloperpub",
            bech32PrefixConsAddr: "akashvalcons",
            bech32PrefixConsPub: "akashvalconspub",
        },
        currencies: [
            {
                coinDenom: "AKT",
                coinMinimalDenom: "uakt",
                coinDecimals: 6,
                coinGeckoId: "akash-network",
            },
        ],
        feeCurrencies: [
            {
                coinDenom: "AKT",
                coinMinimalDenom: "uakt",
                coinDecimals: 6,
                coinGeckoId: "akash-network",
            },
        ],
        coinType: 118,
        features: ["stargate", "ibc-transfer"],
    },
};
//# sourceMappingURL=akash-testnet.js.map