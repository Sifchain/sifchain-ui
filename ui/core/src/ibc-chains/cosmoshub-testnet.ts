import { Network } from "entities";
import { IBCChainConfig } from "./IBCChainConfig";

export const COSMOSHUB_TESTNET: IBCChainConfig = {
  network: Network.COSMOSHUB,
  chainId: "cosmoshub-testnet",
  rpcUrl:
    "http://rpc-a941f6afd0d994a57979ffbaf284d2c0-95f50faefa055d52.elb.us-west-2.amazonaws.com:26657",
  restUrl: "https://api.testnet.cosmos.network",
  keplrChainInfo: {
    rpc:
      "http://rpc-a941f6afd0d994a57979ffbaf284d2c0-95f50faefa055d52.elb.us-west-2.amazonaws.com:26657",
    rest: "https://api.testnet.cosmos.network",
    chainId: "cosmoshub-testnet",
    chainName: "Cosmos Testnet",
    stakeCurrency: {
      coinDenom: "PHOTON",
      coinMinimalDenom: "uphoton",
      coinDecimals: 6,
      coinGeckoId: "cosmos",
    },
    walletUrl: "https://wallet.keplr.app/#/cosmoshub/stake",
    walletUrlForStaking: "https://wallet.keplr.app/#/cosmoshub/stake",
    bip44: {
      coinType: 118,
    },
    bech32Config: {
      bech32PrefixAccAddr: "cosmos",
      bech32PrefixAccPub: "cosmospub",
      bech32PrefixValAddr: "cosmosvaloper",
      bech32PrefixValPub: "cosmosvaloperpub",
      bech32PrefixConsAddr: "cosmosvalcons",
      bech32PrefixConsPub: "cosmosvalconspub",
    },
    currencies: [
      {
        coinDenom: "PHOTON",
        coinMinimalDenom: "uphoton",
        coinDecimals: 6,
        coinGeckoId: "cosmos",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "PHOTON",
        coinMinimalDenom: "uphoton",
        coinDecimals: 6,
        coinGeckoId: "cosmos",
      },
    ],
    coinType: 118,
    features: ["stargate", "ibc-transfer"],
  },
};
