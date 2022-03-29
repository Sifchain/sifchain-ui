import { Network, IBCChainConfig } from "../../../entities";

export const JUNO_TESTNET: IBCChainConfig = {
  chainType: "ibc",
  network: Network.JUNO,
  displayName: "Juno",
  blockExplorerUrl: "http://junoscan.com",
  nativeAssetSymbol: "ujuno",
  chainId: "junosif-1",
  rpcUrl: "https://proxies.sifchain.finance/api/junosif-1/rpc",
  restUrl: "https://proxies.sifchain.finance/api/junosif-1/rest",
  features: {
    erc20Transfers: true,
  },
  keplrChainInfo: {
    rpc: "https://proxies.sifchain.finance/api/junosif-1/rpc",
    rest: "https://proxies.sifchain.finance/api/junosif-1/rest",
    chainId: "junosif-1",
    chainName: "Juno Testnet (Sifchain)",
    stakeCurrency: {
      coinDenom: "JUNO",
      coinMinimalDenom: "ujuno",
      coinDecimals: 6,
      coinGeckoId: "pool:ujuno",
    },
    walletUrl: "https://wallet.keplr.app/#/juno/stake",
    walletUrlForStaking: "https://stake.fish/en/juno/",
    bip44: {
      coinType: 118,
    },
    bech32Config: {
      bech32PrefixAccAddr: "juno",
      bech32PrefixAccPub: "junopub",
      bech32PrefixValAddr: "junovaloper",
      bech32PrefixValPub: "junovaloperpub",
      bech32PrefixConsAddr: "junovalcons",
      bech32PrefixConsPub: "junovalconspub",
    },
    currencies: [
      {
        coinDenom: "JUNO",
        coinMinimalDenom: "ujuno",
        coinDecimals: 6,
        coinGeckoId: "pool:ujuno",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "JUNO",
        coinMinimalDenom: "ujuno",
        coinDecimals: 6,
        coinGeckoId: "pool:ujuno",
      },
    ],
    coinType: 118,
    features: ["stargate", "ibc-transfer"],
  },
};
