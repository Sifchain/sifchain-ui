import { Network, IBCChainConfig } from "../../../entities";

export const JUNO_MAINNET: IBCChainConfig = {
  chainType: "ibc",
  network: Network.JUNO,
  displayName: "Juno",
  blockExplorerUrl: "http://junoscan.com",
  nativeAssetSymbol: "ujuno",
  chainId: "juno-1",
  rpcUrl: "https://rpc-juno.itastakers.com",
  restUrl: "https://lcd-juno.itastakers.com",
  keplrChainInfo: {
    rpc: "https://rpc-juno.itastakers.com",
    rest: "https://lcd-juno.itastakers.com",
    chainId: "juno-1",
    chainName: "Juno",
    stakeCurrency: {
      coinDenom: "JUNO",
      coinMinimalDenom: "ujuno",
      coinDecimals: 6,
      coinGeckoId: "juno",
    },
    walletUrl: "https://wallet.keplr.app/#/juno/stake",
    walletUrlForStaking: "https://wallet.keplr.app/#/juno/stake",
    bip44: {
      coinType: 118,
    },
    bech32Config: {
      bech32PrefixAccAddr: "juno",
      bech32PrefixAccPub: "junopub",
      bech32PrefixValAddr: "junovaloper",
      bech32PrefixValPub: "junovaloperpub",
      bech32PrefixConsAddr: "junovalcons",
      bech32PrefixConsPub: "junovalconspub",
    },
    currencies: [
      {
        coinDenom: "JUNO",
        coinMinimalDenom: "ujuno",
        coinDecimals: 6,
        coinGeckoId: "juno",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "JUNO",
        coinMinimalDenom: "ujuno",
        coinDecimals: 6,
        coinGeckoId: "juno",
      },
    ],
    coinType: 118,
    features: ["stargate", "ibc-transfer"],
  },
};
