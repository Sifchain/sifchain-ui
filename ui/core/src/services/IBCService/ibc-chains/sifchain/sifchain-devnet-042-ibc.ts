import { Network } from "../../../../entities";
import { IBCChainConfig } from "../../IBCChainConfig";

export const SIFCHAIN_DEVNET_042_IBC: IBCChainConfig = {
  network: Network.SIFCHAIN,
  chainId: "sifchain-devnet-042-ibc",
  rpcUrl: "https://rpc-devnet-042-ibc.sifchain.finance",
  restUrl: "https://api-devnet-042-ibc.sifchain.finance",
  keplrChainInfo: {
    chainName: "SifDev-042-IBC",
    chainId: "sifchain-devnet-042-ibc",
    rpc: "https://rpc-devnet-042-ibc.sifchain.finance",
    rest: "https://api-devnet-042-ibc.sifchain.finance",
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
