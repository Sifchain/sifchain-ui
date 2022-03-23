import { Network, IBCChainConfig } from "../../../entities";

export const PERSISTENCE_TESTNET: IBCChainConfig = {
  network: Network.PERSISTENCE,
  chainType: "ibc",
  displayName: "Persistence",
  blockExplorerUrl: "https://test-core-1.explorer.persistence.one/",
  nativeAssetSymbol: "uxprt",
  chainId: "test-core-1",
  rpcUrl: "https://proxies.sifchain.finance/api/test-core-1/rpc",
  restUrl: "https://proxies.sifchain.finance/api/test-core-1/rest",
  keplrChainInfo: {
    rpc: "https://proxies.sifchain.finance/api/test-core-1/rpc",
    rest: "https://proxies.sifchain.finance/api/test-core-1/rest",
    chainId: "test-core-1",
    chainName: "Persistence Testnet",
    stakeCurrency: {
      coinDenom: "XPRT",
      coinMinimalDenom: "uxprt",
      coinDecimals: 6,
      coinGeckoId: "persistence",
    },
    walletUrl: "https://wallet.keplr.app/#/persistence/stake",
    walletUrlForStaking: "https://wallet.keplr.app/#/persistence/stake",
    bip44: {
      coinType: 118,
    },
    bech32Config: {
      bech32PrefixAccAddr: "persistence",
      bech32PrefixAccPub: "persistencepub",
      bech32PrefixValAddr: "persistencevaloper",
      bech32PrefixValPub: "persistencevaloperpub",
      bech32PrefixConsAddr: "persistencevalcons",
      bech32PrefixConsPub: "persistencevalconspub",
    },
    currencies: [
      {
        coinDenom: "XPRT",
        coinMinimalDenom: "uxprt",
        coinDecimals: 6,
        coinGeckoId: "persistence",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "XPRT",
        coinMinimalDenom: "uxprt",
        coinDecimals: 6,
        coinGeckoId: "persistence",
      },
    ],
    coinType: 118,
    features: ["stargate", "ibc-transfer"],
  },
};
