import { Network, IBCChainConfig } from "../../../entities";

// We have to enable JUNO exports in Testnet env only.
// There is no good way to do this ATM, but this should be gone within
// 2 weeks. We only need this because testnet backend only has some IBC
// chains running.
// https://sifchain.slack.com/archives/C02R4KV4KBR/p1642785814110500?thread_ts=1642784506.100800&cid=C02R4KV4KBR
let IS_TESTNET = false;
try {
  IS_TESTNET =
    window.location.hostname === "testnet.sifchain.finance" ||
    window.location.hostname === "localhost";
} catch (_) {}

export const JUNO_MAINNET: IBCChainConfig = {
  chainType: "ibc",
  network: Network.JUNO,
  displayName: "Juno",
  blockExplorerUrl: "http://junoscan.com",
  nativeAssetSymbol: "ujuno",
  chainId: "juno-1",
  rpcUrl: "https://proxies.sifchain.finance/api/juno-1/rpc",
  restUrl: "https://proxies.sifchain.finance/api/juno-1/rest",
  features: {
    erc20Transfers: IS_TESTNET,
  },
  keplrChainInfo: {
    rpc: "https://proxies.sifchain.finance/api/juno-1/rpc",
    rest: "https://proxies.sifchain.finance/api/juno-1/rest",
    chainId: "juno-1",
    chainName: "Juno",
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
