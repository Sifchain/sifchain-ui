import { Network } from "../../../entities";
export const IRIS_MAINNET = {
    network: Network.IRIS,
    chainType: "ibc",
    displayName: "IRISnet",
    blockExplorerUrl: "https://irishub.iobscan.io/",
    nativeAssetSymbol: "uiris",
    chainId: "irishub-1",
    rpcUrl: "https://proxies.sifchain.finance/api/irishub-1/rpc",
    restUrl: "https://proxies.sifchain.finance/api/irishub-1/rest",
    keplrChainInfo: {
        rpc: "https://proxies.sifchain.finance/api/irishub-1/rpc",
        rest: "https://proxies.sifchain.finance/api/irishub-1/rest",
        chainId: "irishub-1",
        chainName: "IRISnet",
        stakeCurrency: {
            coinDenom: "IRIS",
            coinMinimalDenom: "uiris",
            coinDecimals: 6,
            coinGeckoId: "iris",
        },
        walletUrl: "https://wallet.keplr.app/#/iris/stake",
        walletUrlForStaking: "https://wallet.keplr.app/#/iris/stake",
        bip44: {
            coinType: 566,
        },
        bech32Config: {
            bech32PrefixAccAddr: "iaa",
            bech32PrefixAccPub: "iaapub",
            bech32PrefixValAddr: "iaavaloper",
            bech32PrefixValPub: "iaavaloperpub",
            bech32PrefixConsAddr: "iaavalcons",
            bech32PrefixConsPub: "iaavalconspub",
        },
        currencies: [
            {
                coinDenom: "IRIS",
                coinMinimalDenom: "uiris",
                coinDecimals: 6,
                coinGeckoId: "iris",
            },
        ],
        feeCurrencies: [
            {
                coinDenom: "IRIS",
                coinMinimalDenom: "uiris",
                coinDecimals: 6,
                coinGeckoId: "iris",
            },
        ],
        coinType: 556,
        features: ["stargate", "ibc-transfer"],
    },
};
//# sourceMappingURL=iris-mainnet.js.map