import { Network, IBCChainConfig } from "../../../entities";

export const LIKECOIN_TESTNET: IBCChainConfig = {
  network: Network.LIKECOIN,
  chainType: "ibc",
  displayName: "LikeCoin",
  blockExplorerUrl: "https://likecoin.bigdipper.live/",
  nativeAssetSymbol: "nanolike",
  chainId: "likecoinsif-1",
  rpcUrl: "https://proxies.sifchain.finance/api/likecoinsif-1/rpc",
  restUrl: "https://proxies.sifchain.finance/api/likecoinsif-1/rest",
  keplrChainInfo: {
    chainId: "likecoinsif-1",
    chainName: "LikeCoin",
    rpc: "https://proxies.sifchain.finance/api/likecoinsif-1/rpc",
    rest: "https://proxies.sifchain.finance/api/likecoinsif-1/rest",
    stakeCurrency: {
      coinDenom: "LIKE",
      coinMinimalDenom: "nanolike",
      coinDecimals: 9,
      coinGeckoId: "likecoin",
    },
    walletUrlForStaking: "https://stake.like.co",
    bip44: {
      coinType: 118,
    },
    bech32Config: {
      bech32PrefixAccAddr: "cosmos",
      bech32PrefixAccPub: "cosmospub",
      bech32PrefixValAddr: "cosmosvaloper",
      bech32PrefixValPub: "cosmosvaloperpub",
      bech32PrefixConsAddr: "cosmosvalcons",
      bech32PrefixConsPub: "cosmosvalconspub",
    },
    currencies: [
      {
        coinDenom: "LIKE",
        coinMinimalDenom: "nanolike",
        coinDecimals: 9,
        coinGeckoId: "likecoin",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "LIKE",
        coinMinimalDenom: "nanolike",
        coinDecimals: 9,
        coinGeckoId: "likecoin",
      },
    ],
    coinType: 118,
    gasPriceStep: {
      low: 0.01,
      average: 1,
      high: 1000,
    },
    features: ["stargate", "ibc-transfer"],
  },
};
