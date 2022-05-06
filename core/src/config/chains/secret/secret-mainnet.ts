import { Network, IBCChainConfig } from "../../../entities";

export const SECRET_MAINNET: IBCChainConfig = {
  chainType: "ibc",
  network: Network.SECRET,
  displayName: "Secret",
  blockExplorerUrl: "https://www.mintscan.io/secret",
  nativeAssetSymbol: "uscrt",
  chainId: "secret-4",
  rpcUrl: "https://proxies.sifchain.finance/api/secret-4/rpc",
  restUrl: "https://proxies.sifchain.finance/api/secret-4/rest",
  denomTracesPath: "/ibc/apps/transfer/v1/denom_traces",
  features: {
    erc20Transfers: true,
  },
  keplrChainInfo: {
    rpc: "https://proxies.sifchain.finance/api/secret-4/rpc",
    rest: "https://proxies.sifchain.finance/api/secret-4/rest",
    chainId: "secret-4",
    chainName: "Secret Network",
    stakeCurrency: {
      coinDenom: "SCRT",
      coinMinimalDenom: "uscrt",
      coinDecimals: 6,
      coinGeckoId: "pool:uscrt",
    },
    walletUrl: "https://wallet.keplr.app/#/secret/stake",
    walletUrlForStaking: "https://wallet.keplr.app/#/secret/stake",
    bip44: {
      coinType: 118,
    },
    bech32Config: {
      bech32PrefixAccAddr: "secret",
      bech32PrefixAccPub: "secretpub",
      bech32PrefixValAddr: "secretvaloper",
      bech32PrefixValPub: "secretvaloperpub",
      bech32PrefixConsAddr: "secretvalcons",
      bech32PrefixConsPub: "secretvalconspub",
    },
    currencies: [
      {
        coinDenom: "SCRT",
        coinMinimalDenom: "uscrt",
        coinDecimals: 6,
        coinGeckoId: "pool:uscrt",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "SCRT",
        coinMinimalDenom: "uscrt",
        coinDecimals: 6,
        coinGeckoId: "pool:uscrt",
      },
    ],
    coinType: 118,
    features: ["stargate", "ibc-transfer"],
  },
};
