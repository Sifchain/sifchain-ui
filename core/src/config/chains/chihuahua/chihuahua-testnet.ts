import { Network, IBCChainConfig } from "../../../entities";

export const CHIHUAHUA_TESTNET: IBCChainConfig = {
  chainType: "ibc",
  network: Network.CHIHUAHUA,
  displayName: "Chihuahua",
  blockExplorerUrl: "https://www.mintscan.io/chihuahua",
  nativeAssetSymbol: "uhuahua",
  chainId: "chihuahuasif-1",
  rpcUrl: "https://proxies.sifchain.finance/api/chihuahuasif-1/rpc",
  restUrl: "https://proxies.sifchain.finance/api/chihuahuasif-1/rest",
  features: {
    erc20Transfers: true,
  },
  keplrChainInfo: {
    rpc: "https://proxies.sifchain.finance/api/chihuahuasif-1/rpc",
    rest: "https://proxies.sifchain.finance/api/chihuahuasif-1/rest",
    chainId: "chihuahuasif-1",
    chainName: "Chihuahua Testnet (Sifchain)",
    stakeCurrency: {
      coinDenom: "HUAHUA",
      coinMinimalDenom: "uhuahua",
      coinDecimals: 6,
      coinGeckoId: "pool:uhuahua",
    },
    walletUrl: "https://wallet.keplr.app/#/huahua-mainnet/stake",
    walletUrlForStaking: "https://wallet.keplr.app/#/huahua-mainnet/stake",
    bip44: {
      coinType: 118,
    },
    bech32Config: {
      bech32PrefixAccAddr: "chihuahua",
      bech32PrefixAccPub: "chihuahuapub",
      bech32PrefixValAddr: "chihuahuavaloper",
      bech32PrefixValPub: "chihuahuavaloperpub",
      bech32PrefixConsAddr: "chihuahuavalcons",
      bech32PrefixConsPub: "chihuahuavalconspub",
    },
    currencies: [
      {
        coinDenom: "HUAHUA",
        coinMinimalDenom: "uhuahua",
        coinDecimals: 6,
        coinGeckoId: "pool:uhuahua",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "HUAHUA",
        coinMinimalDenom: "uhuahua",
        coinDecimals: 6,
        coinGeckoId: "pool:uhuahua",
      },
    ],
    coinType: 118,
    features: ["stargate", "ibc-transfer"],
  },
};
