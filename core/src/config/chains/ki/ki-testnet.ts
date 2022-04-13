import { Network, IBCChainConfig } from "../../../entities";

export const KI_TESTNET: IBCChainConfig = {
  chainType: "ibc",
  network: Network.KI,
  displayName: "Ki",
  blockExplorerUrl: "https://www.mintscan.io/ki",
  nativeAssetSymbol: "uxki",
  chainId: "kisif-1",
  rpcUrl: "https://proxies.sifchain.finance/api/kisif-1/rpc",
  restUrl: "https://proxies.sifchain.finance/api/kisif-1/rest",
  features: {
    erc20Transfers: true,
  },
  keplrChainInfo: {
    rpc: "https://proxies.sifchain.finance/api/kisif-1/rpc",
    rest: "https://proxies.sifchain.finance/api/kisif-1/rest",
    chainId: "kisif-1",
    chainName: "Ki Testnet (Sifchain)",
    stakeCurrency: {
      coinDenom: "KI",
      coinMinimalDenom: "uxki",
      coinDecimals: 6,
      coinGeckoId: "pool:uxki",
    },
    walletUrl: "https://wallet.keplr.app/#/ki-mainnet/stake",
    walletUrlForStaking: "https://wallet.keplr.app/#/ki-mainnet/stake",
    bip44: {
      coinType: 118,
    },
    bech32Config: {
      bech32PrefixAccAddr: "ki",
      bech32PrefixAccPub: "kipub",
      bech32PrefixValAddr: "kivaloper",
      bech32PrefixValPub: "kivaloperpub",
      bech32PrefixConsAddr: "kivalcons",
      bech32PrefixConsPub: "kivalconspub",
    },
    currencies: [
      {
        coinDenom: "KI",
        coinMinimalDenom: "uxki",
        coinDecimals: 6,
        coinGeckoId: "pool:uxki",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "KI",
        coinMinimalDenom: "uxki",
        coinDecimals: 6,
        coinGeckoId: "pool:uxki",
      },
    ],
    coinType: 118,
    features: ["stargate", "ibc-transfer"],
  },
};
