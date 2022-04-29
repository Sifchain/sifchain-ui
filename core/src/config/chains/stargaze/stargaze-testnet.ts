import { Network, IBCChainConfig } from "../../../entities";

export const STARGAZE_TESTNET: IBCChainConfig = {
  chainType: "ibc",
  network: Network.STARGAZE,
  displayName: "Stargaze",
  blockExplorerUrl: "https://www.mintscan.io/stargaze",
  nativeAssetSymbol: "ustarx",
  chainId: "stargazesif-1",
  rpcUrl: "https://proxies.sifchain.finance/api/stargazesif-1/rpc",
  restUrl: "https://proxies.sifchain.finance/api/stargazesif-1/rest",
  denomTracesPath: "/ibc/apps/transfer/v1/denom_traces",
  features: {
    erc20Transfers: true,
  },
  keplrChainInfo: {
    rpc: "https://proxies.sifchain.finance/api/stargazesif-1/rpc",
    rest: "https://proxies.sifchain.finance/api/stargazesif-1/rest",
    chainId: "stargazesif-1",
    chainName: "Stargaze Testnet (Sifchain)",
    stakeCurrency: {
      coinDenom: "STARX",
      coinMinimalDenom: "ustarx",
      coinDecimals: 6,
      coinGeckoId: "pool:ustarx",
    },
    walletUrl: "https://wallet.keplr.app/#/stargaze/stake",
    walletUrlForStaking: "https://wallet.keplr.app/#/stargaze/stake",
    bip44: {
      coinType: 118,
    },
    bech32Config: {
      bech32PrefixAccAddr: "stars",
      bech32PrefixAccPub: "starspub",
      bech32PrefixValAddr: "starsvaloper",
      bech32PrefixValPub: "starsvaloperpub",
      bech32PrefixConsAddr: "starsvalcons",
      bech32PrefixConsPub: "starsvalconspub",
    },
    currencies: [
      {
        coinDenom: "STARX",
        coinMinimalDenom: "ustarx",
        coinDecimals: 6,
        coinGeckoId: "pool:ustarx",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "STARX",
        coinMinimalDenom: "ustarx",
        coinDecimals: 6,
        coinGeckoId: "pool:ustarx",
      },
    ],
    coinType: 118,
    features: ["stargate", "ibc-transfer"],
  },
};
