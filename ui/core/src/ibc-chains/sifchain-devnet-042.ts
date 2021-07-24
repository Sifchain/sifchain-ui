import { Network } from "entities";
import { IBCChainConfig } from "./IBCChainConfig";

export const SIFCHAIN_DEVNET_042: IBCChainConfig = {
  network: Network.SIFCHAIN,
  chainId: "sifchain-devnet-042",
  rpcUrl:
    "http://rpc-a941f6afd0d994a57979ffbaf284d2c0-95f50faefa055d52.elb.us-west-2.amazonaws.com:26657",
  restUrl: "https://api.testnet.cosmos.network",
  keplrChainInfo: {
    chainName: "SifchainDevnet-042",
    chainId: "sifchain-devnet-042",
    rpc: "https://rpc-devnet-042.sifchain.finance",
    rest: "https://api-devnet-042.sifchain.finance",
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
  },
};
