import { Network } from "../../../entities";
import { IBCChainConfig } from "../../../services/IBCService/IBCChainConfig";

export const SENTINEL_TESTNET: IBCChainConfig = {
  network: Network.SENTINEL,
  chainId: "sentinelhub-2",
  rpcUrl: "https://rpc-sentinel.keplr.app",
  restUrl: "https://lcd-sentinel.keplr.app",
  keplrChainInfo: {
    rpc: "https://rpc-sentinel.keplr.app",
    rest: "https://lcd-sentinel.keplr.app",
    chainId: "sentinelhub-2",
    chainName: "Sentinel",
    stakeCurrency: {
      coinDenom: "udvpn",
      coinMinimalDenom: "udvpn",
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
        coinDenom: "udvpn",
        coinMinimalDenom: "udvpn",
        coinDecimals: 18,
        coinGeckoId: "sentinel",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "udvpn",
        coinMinimalDenom: "udvpn",
        coinDecimals: 18,
        coinGeckoId: "sentinel",
      },
    ],
    coinType: 118,
    features: ["stargate", "ibc-transfer"],
  },
};
