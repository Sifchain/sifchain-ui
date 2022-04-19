import { Network, IBCChainConfig } from "../../../entities";

export const BITSONG_TESTNET: IBCChainConfig = {
  chainType: "ibc",
  network: Network.BITSONG,
  displayName: "Bitsong",
  blockExplorerUrl: "https://www.mintscan.io/bitsong",
  nativeAssetSymbol: "ubtsg",
  chainId: "bitsongsif-1",
  rpcUrl: "https://proxies.sifchain.finance/api/bitsongsif-1/rpc",
  restUrl: "https://proxies.sifchain.finance/api/bitsongsif-1/rest",
  features: {
    erc20Transfers: true,
  },
  keplrChainInfo: {
    rpc: "https://proxies.sifchain.finance/api/bitsongsif-1/rpc",
    rest: "https://proxies.sifchain.finance/api/bitsongsif-1/rest",
    chainId: "bitsongsif-1",
    chainName: "Bitsong Testnet (Sifchain)",
    stakeCurrency: {
      coinDenom: "BTSG",
      coinMinimalDenom: "ubtsg",
      coinDecimals: 6,
      coinGeckoId: "pool:ubtsg",
    },
    walletUrl: "https://wallet.keplr.app/#/btsg-mainnet/stake",
    walletUrlForStaking: "https://wallet.keplr.app/#/btsg-mainnet/stake",
    bip44: {
      coinType: 118,
    },
    bech32Config: {
      bech32PrefixAccAddr: "bitsong",
      bech32PrefixAccPub: "bitsongpub",
      bech32PrefixValAddr: "bitsongvaloper",
      bech32PrefixValPub: "bitsongvaloperpub",
      bech32PrefixConsAddr: "bitsongvalcons",
      bech32PrefixConsPub: "bitsongvalconspub",
    },
    currencies: [
      {
        coinDenom: "BTSG",
        coinMinimalDenom: "ubtsg",
        coinDecimals: 6,
        coinGeckoId: "pool:ubtsg",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "BTSG",
        coinMinimalDenom: "ubtsg",
        coinDecimals: 6,
        coinGeckoId: "pool:ubtsg",
      },
    ],
    coinType: 118,
    features: ["stargate", "ibc-transfer"],
  },
};
