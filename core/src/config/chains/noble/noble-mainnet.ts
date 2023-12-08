import { Network, IBCChainConfig } from "../../../entities";

export const NOBLE_MAINNET: IBCChainConfig = {
  chainType: "ibc",
  network: Network.NOBLE,
  displayName: "Noble",
  blockExplorerUrl: "https://www.mintscan.io/noble",
  nativeAssetSymbol: "uusdc",
  chainId: "noble-1",
  rpcUrl: "https://proxies.sifchain.finance/api/noble-1/rpc",
  restUrl: "https://proxies.sifchain.finance/api/noble-1/rest",
  features: {
    erc20Transfers: false,
  },
  keplrChainInfo: {
    rpc: "https://proxies.sifchain.finance/api/noble-1/rpc",
    rest: "https://proxies.sifchain.finance/api/noble-1/rest",
    chainId: "noble-1",
    chainName: "Noble",
    stakeCurrency: {
      coinDenom: "USDC (Noble)",
      coinMinimalDenom: "uusdc",
      coinDecimals: 6,
      coinGeckoId: "usdc",
    },
    walletUrl: "https://wallet.keplr.app/#/noble/stake",
    walletUrlForStaking: "https://wallet.keplr.app/#/cosmoshub/stake",
    bip44: {
      coinType: 118,
    },
    bech32Config: {
      bech32PrefixAccAddr: "noble",
      bech32PrefixAccPub: "noblepub",
      bech32PrefixValAddr: "noblevaloper",
      bech32PrefixValPub: "noblevaloperpub",
      bech32PrefixConsAddr: "noblevalcons",
      bech32PrefixConsPub: "noblevalconspub",
    },
    currencies: [
      {
        coinDenom: "USDC (Noble)",
        coinMinimalDenom: "uusdc",
        coinDecimals: 6,
        coinGeckoId: "usdc",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "USDC",
        coinMinimalDenom: "uusdc",
        coinDecimals: 6,
        coinGeckoId: "usdc",
      },
    ],
    coinType: 118,
    features: ["stargate", "ibc-transfer"],
  },
};
