import { Network } from "../../../entities";
import { IBCChainConfig } from "../IBCChainConfig";

export const SIFCHAIN_DEVNET_042: IBCChainConfig = {
  network: Network.SIFCHAIN,
  chainId: "sifchain-devnet",
  rpcUrl: "https://rpc-devnet.sifchain.finance",
  restUrl: "https://api-devnet.sifchain.finance",
  keplrChainInfo: {
    chainName: "SifDev-042-IBC",
    chainId: "sifchain-devnet",
    rpc: "https://rpc-devnet.sifchain.finance",
    rest: "https://api-devnet.sifchain.finance",
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
