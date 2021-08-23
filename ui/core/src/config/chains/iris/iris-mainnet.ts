import { Network, IBCChainConfig } from "../../../entities";

export const IRIS_MAINNET: IBCChainConfig = {
  network: Network.IRIS,
  chainType: "ibc",
  displayName: "Iris",
  blockExplorerUrl: "https://irishub.iobscan.io/",
  nativeAssetSymbol: "unyan",
  chainId: "nyancat-8",
  rpcUrl: "https://rpc-iris.keplr.app/",
  restUrl: "https://lcd-iris.keplr.app/",
  keplrChainInfo: {
    rpc: "https://rpc-iris.keplr.app/",
    rest: "https://lcd-iris.keplr.app/",
    chainId: "nyancat-8",
    chainName: "Iris Testnet",
    stakeCurrency: {
      coinDenom: "NYAN",
      coinMinimalDenom: "unyan",
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
        coinDenom: "NYAN",
        coinMinimalDenom: "unyan",
        coinDecimals: 6,
        coinGeckoId: "iris",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "NYAN",
        coinMinimalDenom: "unyan",
        coinDecimals: 6,
        coinGeckoId: "iris",
      },
    ],
    coinType: 556,
    features: ["stargate", "ibc-transfer"],
  },
};
