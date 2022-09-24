import { Network, IBCChainConfig } from "../../../entities";

export const SIFCHAIN_STAGING: IBCChainConfig = {
  network: Network.SIFCHAIN,
  chainType: "ibc",
  displayName: "Sifchain",
  blockExplorerUrl: "https://www.mintscan.io/sifchain",
  nativeAssetSymbol: "rowan",
  chainId: "sifchain-staging-1",
  rpcUrl: "https://proxies.sifchain.finance/api/sifchain-staging/rpc",
  restUrl: "https://proxies.sifchain.finance/api/sifchain-staging/rest",
  denomTracesPath: "/ibc/apps/transfer/v1/denom_traces",
  keplrChainInfo: {
    chainName: "Sifchain Staging",
    chainId: "sifchain-staging-1",
    rpc: "https://proxies.sifchain.finance/api/sifchain-staging/rpc",
    rest: "https://proxies.sifchain.finance/api/sifchain-staging/rest",
    stakeCurrency: {
      coinDenom: "ROWAN",
      coinMinimalDenom: "rowan",
      coinDecimals: 18,
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: {
      bech32PrefixAccAddr: "sif",
      bech32PrefixAccPub: "sifpub",
      bech32PrefixValAddr: "sifvaloper",
      bech32PrefixValPub: "sifvaloperpub",
      bech32PrefixConsAddr: "sifvalcons",
      bech32PrefixConsPub: "sifvalconspub",
    },
    currencies: [
      {
        coinDenom: "ROWAN",
        coinMinimalDenom: "rowan",
        coinDecimals: 18,
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "ROWAN",
        coinMinimalDenom: "rowan",
        coinDecimals: 18,
      },
    ],
    coinType: 118,
    gasPriceStep: {
      low: 5000000000000,
      average: 6500000000000,
      high: 8000000000000,
    },
    features: ["stargate", "ibc-transfer"],
  },
};
