import { NetworkChainsLookup } from "./NetEnvChainsLookup";

export default <NetworkChainsLookup>{
  sifchain: {
    network: "sifchain",
    displayName: "Sifchain",
    blockExplorerUrl: "https://blockexplorer-devnet.sifchain.finance",
    nativeAssetSymbol: "rowan",
  },
  ethereum: {
    network: "ethereum",
    displayName: "Ethereum",
    blockExplorerUrl: "https://ropsten.etherscan.io",
    nativeAssetSymbol: "eth",
  },
  cosmoshub: {
    network: "cosmoshub",
    displayName: "Cosmoshub",
    blockExplorerUrl: "https://mintscan.io/cosmos",
    nativeAssetSymbol: "uphoton",
  },
  iris: {
    network: "iris",
    displayName: "Iris",
    blockExplorerUrl: "https://nyancat.iobscan.io/",
    nativeAssetSymbol: "unyan",
  },
  akash: {
    network: "akash",
    displayName: "Akash",
    blockExplorerUrl: "https://akash.bigdipper.live/",
    nativeAssetSymbol: "uakt",
  },
  sentinel: {
    network: "sentinel",
    displayName: "Sentinel",
    blockExplorerUrl: "https://explorer.sentinel.co/",
    nativeAssetSymbol: "udvpn",
  },
};
