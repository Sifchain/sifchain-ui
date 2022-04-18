import { Network, IBCChainConfig } from "../../../entities";

export const CERBERUS_TESTNET: IBCChainConfig = {
  chainType: "ibc",
  network: Network.CERBERUS,
  displayName: "Cerberus",
  blockExplorerUrl: "https://www.mintscan.io/cerberus",
  nativeAssetSymbol: "ucrbrus",
  chainId: "cerberussif-1",
  rpcUrl: "https://proxies.sifchain.finance/api/cerberussif-1/rpc",
  restUrl: "https://proxies.sifchain.finance/api/cerberussif-1/rest",
  features: {
    erc20Transfers: true,
  },
  keplrChainInfo: {
    rpc: "https://proxies.sifchain.finance/api/cerberussif-1/rpc",
    rest: "https://proxies.sifchain.finance/api/cerberussif-1/rest",
    chainId: "cerberussif-1",
    chainName: "Cerberus Testnet (Sifchain)",
    stakeCurrency: {
      coinDenom: "CRBRUS",
      coinMinimalDenom: "ucrbrus",
      coinDecimals: 6,
      coinGeckoId: "pool:ucrbrus",
    },
    walletUrl: "https://wallet.keplr.app/#/crbrus-mainnet/stake",
    walletUrlForStaking: "https://wallet.keplr.app/#/crbrus-mainnet/stake",
    bip44: {
      coinType: 118,
    },
    bech32Config: {
      bech32PrefixAccAddr: "cerberus",
      bech32PrefixAccPub: "cerberuspub",
      bech32PrefixValAddr: "cerberusvaloper",
      bech32PrefixValPub: "cerberusvaloperpub",
      bech32PrefixConsAddr: "cerberusvalcons",
      bech32PrefixConsPub: "cerberusvalconspub",
    },
    currencies: [
      {
        coinDenom: "CRBRUS",
        coinMinimalDenom: "ucrbrus",
        coinDecimals: 6,
        coinGeckoId: "pool:ucrbrus",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "CRBRUS",
        coinMinimalDenom: "ucrbrus",
        coinDecimals: 6,
        coinGeckoId: "pool:ucrbrus",
      },
    ],
    coinType: 118,
    features: ["stargate", "ibc-transfer"],
  },
};
