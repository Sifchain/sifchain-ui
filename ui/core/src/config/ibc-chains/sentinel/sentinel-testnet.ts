import { Network } from "../../../entities";
import { IBCChainConfig } from "../../../services/IBCService/IBCChainConfig";

export const COSMOSHUB_TESTNET: IBCChainConfig = {
  network: Network.COSMOSHUB,
  chainId: "sentinelhub-2",
  rpcUrl: "http://rpc.sentinel.co",
  restUrl: "http://api.sentinel.co",
  keplrChainInfo: {
    rpc: "http://rpc.sentinel.co",
    rest: "http://api.sentinel.co",
    chainId: "sentinelhub-2",
    chainName: "Sentinel Testnet",
    stakeCurrency: {
      coinDenom: "TSENT",
      coinMinimalDenom: "tsent",
      coinDecimals: 18,
      coinGeckoId: "sentinel",
    },
    walletUrl: "https://wallet.keplr.app/#/cosmoshub/stake",
    walletUrlForStaking: "https://wallet.keplr.app/#/cosmoshub/stake",
    bip44: {
      coinType: 118,
    },
    bech32Config: {
      bech32PrefixAccAddr: "sent",
      bech32PrefixAccPub: "sentpub",
      bech32PrefixValAddr: "sentvaloper",
      bech32PrefixValPub: "sentvaloperpub",
      bech32PrefixConsAddr: "sentvalcons",
      bech32PrefixConsPub: "sentvalconspub",
    },
    currencies: [
      {
        coinDenom: "TSENT",
        coinMinimalDenom: "tsent",
        coinDecimals: 18,
        coinGeckoId: "sentinel",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "TSENT",
        coinMinimalDenom: "tsent",
        coinDecimals: 18,
        coinGeckoId: "sentinel",
      },
    ],
    coinType: 118,
    features: ["stargate", "ibc-transfer"],
  },
};
