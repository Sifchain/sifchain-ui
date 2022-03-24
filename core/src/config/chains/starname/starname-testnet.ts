import { Network, IBCChainConfig } from "../../../entities";

export const STARNAME_TESTNET: IBCChainConfig = {
  chainType: "ibc",
  network: Network.STARNAME,
  displayName: "Starname",
  blockExplorerUrl: "https://www.mintscan.io/starname",
  nativeAssetSymbol: "uiov",
  chainId: "starnamesif-1",
  rpcUrl: "https://proxies.sifchain.finance/api/starnamesif-1/rpc",
  restUrl: "https://proxies.sifchain.finance/api/starnamesif-1/rest",
  features: {
    erc20Transfers: true,
  },
  keplrChainInfo: {
    rpc: "https://proxies.sifchain.finance/api/starnamesif-1/rpc",
    rest: "https://proxies.sifchain.finance/api/starnamesif-1/rest",
    chainId: "starnamesif-1",
    chainName: "Starname Testnet (Sifchain)",
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
