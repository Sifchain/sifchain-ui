import { Network, IBCChainConfig } from "../../../entities";

export const AKASH_MAINNET: IBCChainConfig = {
  network: Network.AKASH,
  chainType: "ibc",
  displayName: "Akash",
  blockExplorerUrl: "https://akash.aneka.io",
  nativeAssetSymbol: "uakt",
  chainId: "akashnet-2",
  rpcUrl: "https://proxies.sifchain.finance/api/akashnet-2/rpc",
  restUrl: "https://proxies.sifchain.finance/api/akashnet-2/rest",
  keplrChainInfo: {
    rpc: "https://proxies.sifchain.finance/api/akashnet-2/rpc",
    rest: "https://proxies.sifchain.finance/api/akashnet-2/rest",
    chainId: "akashnet-2",
    chainName: "Akash",
    stakeCurrency: {
      coinDenom: "AKT",
      coinMinimalDenom: "uakt",
      coinDecimals: 6,
      coinGeckoId: "akash-network",
    },
    walletUrl: "https://wallet.keplr.app/#/akash/stake",
    walletUrlForStaking: "https://wallet.keplr.app/#/akash/stake",
    bip44: {
      coinType: 118,
    },
    bech32Config: {
      bech32PrefixAccAddr: "akash",
      bech32PrefixAccPub: "akashpub",
      bech32PrefixValAddr: "akashvaloper",
      bech32PrefixValPub: "akashvaloperpub",
      bech32PrefixConsAddr: "akashvalcons",
      bech32PrefixConsPub: "akashvalconspub",
    },
    currencies: [
      {
        coinDenom: "AKT",
        coinMinimalDenom: "uakt",
        coinDecimals: 6,
        coinGeckoId: "akash-network",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "AKT",
        coinMinimalDenom: "uakt",
        coinDecimals: 6,
        coinGeckoId: "akash-network",
      },
    ],
    coinType: 118,
    features: ["stargate", "ibc-transfer"],
  },
};
