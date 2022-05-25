import { Network, IBCChainConfig } from "../../../entities";

export const GRAVITY_MAINNET: IBCChainConfig = {
  chainType: "ibc",
  network: Network.GRAVITY,
  displayName: "Gravity-Bridge",
  blockExplorerUrl: "https://www.mintscan.io/gravity-bridge/",
  nativeAssetSymbol: "ugraviton",
  chainId: "gravity-bridge-3",
  rpcUrl: "https://proxies.sifchain.finance/api/gravity-bridge-3/rpc",
  restUrl: "https://proxies.sifchain.finance/api/gravity-bridge-3/rest",
  features: {
    erc20Transfers: false,
  },
  keplrChainInfo: {
    rpc: "https://proxies.sifchain.finance/api/gravity-bridge-3/rpc",
    rest: "https://proxies.sifchain.finance/api/gravity-bridge-3/rest",
    chainId: "gravity-bridge-3",
    chainName: "Juno",
    stakeCurrency: {
      coinDenom: "GRAVITY",
      coinMinimalDenom: "ugraviton",
      coinDecimals: 6,
      coinGeckoId: "pool:ugraviton",
    },
    walletUrl: "https://wallet.keplr.app/#/gravity-bridge/stake",
    walletUrlForStaking: "https://wallet.keplr.app/#/gravity-bridge/stake",
    bip44: {
      coinType: 118,
    },
    bech32Config: {
      bech32PrefixAccAddr: "gravity",
      bech32PrefixAccPub: "gravitypub",
      bech32PrefixValAddr: "gravityvaloper",
      bech32PrefixValPub: "gravityvaloperpub",
      bech32PrefixConsAddr: "gravityvalcons",
      bech32PrefixConsPub: "gravityvalconspub",
    },
    currencies: [
      {
        coinDenom: "GRAVITY",
        coinMinimalDenom: "ugraviton",
        coinDecimals: 6,
        coinGeckoId: "pool:ugraviton",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "GRAVITY",
        coinMinimalDenom: "ugraviton",
        coinDecimals: 6,
        coinGeckoId: "pool:ugraviton",
      },
    ],
    coinType: 118,
    features: ["stargate", "ibc-transfer"],
  },
};
