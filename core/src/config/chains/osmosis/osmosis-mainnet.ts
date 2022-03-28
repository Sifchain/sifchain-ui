import { Network, IBCChainConfig } from "../../../entities";

export const OSMOSIS_MAINNET: IBCChainConfig = {
  chainType: "ibc",
  network: Network.OSMOSIS,
  displayName: "Osmosis",
  blockExplorerUrl: "https://www.mintscan.io/osmosis",
  nativeAssetSymbol: "uosmo",
  chainId: "osmosis-1",
  rpcUrl: "https://proxies.sifchain.finance/api/osmosis-1/rpc",
  restUrl: "https://proxies.sifchain.finance/api/osmosis-1/rest",
  features: {
    erc20Transfers: false,
  },
  keplrChainInfo: {
    rpc: "https://proxies.sifchain.finance/api/osmosis-1/rpc",
    rest: "https://proxies.sifchain.finance/api/osmosis-1/rest",
    chainId: "osmosis-1",
    chainName: "Osmosis",
    stakeCurrency: {
      coinDenom: "OSMO",
      coinMinimalDenom: "uosmo",
      coinDecimals: 6,
      coinGeckoId: "osmosis",
    },
    walletUrl: "https://wallet.keplr.app/#/osmosis/stake",
    walletUrlForStaking: "https://wallet.keplr.app/#/cosmoshub/stake",
    bip44: {
      coinType: 118,
    },
    bech32Config: {
      bech32PrefixAccAddr: "osmo",
      bech32PrefixAccPub: "osmopub",
      bech32PrefixValAddr: "osmovaloper",
      bech32PrefixValPub: "osmovaloperpub",
      bech32PrefixConsAddr: "osmovalcons",
      bech32PrefixConsPub: "osmovalconspub",
    },
    currencies: [
      {
        coinDenom: "OSMO",
        coinMinimalDenom: "uosmo",
        coinDecimals: 6,
        coinGeckoId: "osmosis",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "OSMO",
        coinMinimalDenom: "uosmo",
        coinDecimals: 6,
        coinGeckoId: "osmosis",
      },
    ],
    coinType: 118,
    features: ["stargate", "ibc-transfer"],
  },
};
