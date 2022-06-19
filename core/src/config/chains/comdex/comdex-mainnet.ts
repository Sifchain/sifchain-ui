import { Network, IBCChainConfig } from "../../../entities";

export const COMDEX_MAINNET: IBCChainConfig = {
  chainType: "ibc",
  network: Network.COMDEX,
  displayName: "Comdex",
  blockExplorerUrl: "https://www.mintscan.io/comdex",
  nativeAssetSymbol: "ucmdx",
  chainId: "comdex-1",
  rpcUrl: "https://proxies.sifchain.finance/api/comdex-1/rpc",
  restUrl: "https://proxies.sifchain.finance/api/comdex-1/rest",
  features: {
    erc20Transfers: true,
  },
  keplrChainInfo: {
    rpc: "https://proxies.sifchain.finance/api/comdex-1/rpc",
    rest: "https://proxies.sifchain.finance/api/comdex-1/rest",
    chainId: "comdex-1",
    chainName: "Comdex",
    stakeCurrency: {
      coinDenom: "CMDX",
      coinMinimalDenom: "ucmdx",
      coinDecimals: 6,
      coinGeckoId: "pool:ucmdx",
    },
    walletUrl: "https://wallet.keplr.app/#/cmdx-mainnet/stake",
    walletUrlForStaking: "https://wallet.keplr.app/#/cmdx-mainnet/stake",
    bip44: {
      coinType: 118,
    },
    bech32Config: {
      bech32PrefixAccAddr: "comdex",
      bech32PrefixAccPub: "comdexpub",
      bech32PrefixValAddr: "comdexvaloper",
      bech32PrefixValPub: "comdexvaloperpub",
      bech32PrefixConsAddr: "comdexvalcons",
      bech32PrefixConsPub: "comdexvalconspub",
    },
    currencies: [
      {
        coinDenom: "CMDX",
        coinMinimalDenom: "ucmdx",
        coinDecimals: 6,
        coinGeckoId: "pool:ucmdx",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "CMDX",
        coinMinimalDenom: "ucmdx",
        coinDecimals: 6,
        coinGeckoId: "pool:ucmdx",
      },
    ],
    coinType: 118,
    features: ["stargate", "ibc-transfer"],
  },
};
