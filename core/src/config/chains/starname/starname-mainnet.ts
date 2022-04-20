import { Network, IBCChainConfig } from "../../../entities";

export const STARNAME_MAINNET: IBCChainConfig = {
  chainType: "ibc",
  network: Network.STARNAME,
  displayName: "Starname",
  blockExplorerUrl: "https://www.mintscan.io/starname",
  nativeAssetSymbol: "uiov",
  chainId: "iov-mainnet-ibc",
  rpcUrl: "https://proxies.sifchain.finance/api/iov-mainnet-ibc/rpc",
  restUrl: "https://proxies.sifchain.finance/api/iov-mainnet-ibc/rest",
  features: {
    erc20Transfers: true,
  },
  keplrChainInfo: {
    rpc: "https://proxies.sifchain.finance/api/iov-mainnet-ibc/rpc",
    rest: "https://proxies.sifchain.finance/api/iov-mainnet-ibc/rest",
    chainId: "iov-mainnet-ibc",
    chainName: "Starname (Sifchain)",
    stakeCurrency: {
      coinDenom: "IOV",
      coinMinimalDenom: "uiov",
      coinDecimals: 6,
      coinGeckoId: "pool:uiov",
    },
    walletUrl: "https://wallet.keplr.app/#/iov-mainnet/stake",
    walletUrlForStaking: "https://wallet.keplr.app/#/iov-mainnet/stake",
    bip44: {
      coinType: 118,
    },
    bech32Config: {
      bech32PrefixAccAddr: "star",
      bech32PrefixAccPub: "starpub",
      bech32PrefixValAddr: "starvaloper",
      bech32PrefixValPub: "starvaloperpub",
      bech32PrefixConsAddr: "starvalcons",
      bech32PrefixConsPub: "starvalconspub",
    },
    currencies: [
      {
        coinDenom: "IOV",
        coinMinimalDenom: "uiov",
        coinDecimals: 6,
        coinGeckoId: "pool:uiov",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "IOV",
        coinMinimalDenom: "uiov",
        coinDecimals: 6,
        coinGeckoId: "pool:uiov",
      },
    ],
    coinType: 118,
    features: ["stargate", "ibc-transfer"],
  },
};

