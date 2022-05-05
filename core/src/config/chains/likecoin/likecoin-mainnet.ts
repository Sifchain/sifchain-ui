import { IBCChainConfig, Network } from "../../../";

export const LIKECOIN_MAINNET: IBCChainConfig = {
  network: Network.LIKECOIN,
  chainType: "ibc",
  displayName: "LikeCoin",
  blockExplorerUrl: "https://likecoin.bigdipper.live/",
  nativeAssetSymbol: "nanolike",
  chainId: "likecoin-mainnet-2",
  rpcUrl: "https://proxies.sifchain.finance/api/likecoin-mainnet-2/rpc",
  restUrl: "https://proxies.sifchain.finance/api/likecoin-mainnet-2/rest",
  keplrChainInfo: {
    chainId: "likecoin-mainnet-2",
    chainName: "LikeCoin",
    rpc: "https://proxies.sifchain.finance/api/likecoin-mainnet-2/rpc",
    rest: "https://proxies.sifchain.finance/api/likecoin-mainnet-2/rest",
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
      bech32PrefixAccAddr: "like",
      bech32PrefixAccPub: "likepub",
      bech32PrefixValAddr: "likevaloper",
      bech32PrefixValPub: "likevaloperpub",
      bech32PrefixConsAddr: "likevalcons",
      bech32PrefixConsPub: "likevalconspub",
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
      low: 1,
      average: 10,
      high: 1000,
    },
    features: ["stargate", "ibc-transfer", "no-legacy-stdTx", "ibc-go"],
  },
};
