import { Network, IBCChainConfig } from "../../../entities";

export const EVMOS_MAINNET: IBCChainConfig = {
  chainType: "ibc",
  network: Network.EVMOS,
  displayName: "EVMOS",
  blockExplorerUrl: "https://evmos.bigdipper.live",
  nativeAssetSymbol: "aevmos",
  chainId: "evmos_9001-2",
  rpcUrl: "https://proxies.sifchain.finance/api/evmos/rpc",
  restUrl: "https://proxies.sifchain.finance/api/evmos/rest",
  denomTracesPath: "/ibc/apps/transfer/v1/denom_traces",
  keplrChainInfo: {
    rpc: "https://proxies.sifchain.finance/api/evmos/rpc",
    rest: "https://proxies.sifchain.finance/api/evmos/rest",
    chainId: "evmos_9001-2",
    chainName: "EVMOS",
    stakeCurrency: {
      coinDenom: "evmos",
      coinMinimalDenom: "aevmos",
      coinDecimals: 18,
      coinGeckoId: "evmos",
    },
    walletUrl: "https://wallet.keplr.app/#/evmos/stake",
    walletUrlForStaking: "https://wallet.keplr.app/#/evmos/stake",
    bip44: {
      coinType: 60,
    },
    bech32Config: {
      bech32PrefixAccAddr: "evmos",
      bech32PrefixAccPub: "evmospub",
      bech32PrefixValAddr: "evmosvaloper",
      bech32PrefixValPub: "evmosvaloperpub",
      bech32PrefixConsAddr: "evmosvalcons",
      bech32PrefixConsPub: "evmosvalconspub",
    },
    currencies: [
      {
        coinDenom: "evmos",
        coinMinimalDenom: "aevmos",
        coinDecimals: 18,
        coinGeckoId: "evmos",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "evmos",
        coinMinimalDenom: "aevmos",
        coinDecimals: 18,
        coinGeckoId: "evmos",
      },
    ],
    coinType: 60,
    features: ["stargate", "ibc-transfer"],
  },
};
