import { EthChainConfig, Network } from "../../../entities";

export const ETHEREUM_TESTNET: EthChainConfig = {
  chainType: "eth",
  chainId: "0x5", // Goerli
  network: Network.ETHEREUM,
  displayName: "Ethereum",
  blockExplorerUrl: "https://goerli.etherscan.io",
  blockExplorerApiUrl: "https://api-goerli.etherscan.io",
  nativeAssetSymbol: "eth",
};
