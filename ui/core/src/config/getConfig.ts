// TODO - Conditional load or build-time tree shake
import localnetconfig from "../config.localnet.json";
import devnetconfig from "../config.devnet.json";
import devnet042config from "../config.devnet-042.json";
import testnet042ibcconfig from "../config.testnet-042-ibc.json";
import testnetconfig from "../config.testnet.json";
import mainnnetconfig from "../config.mainnet.json";

import assetsEthereumLocalnet from "../assets.ethereum.localnet.json";
import assetsEthereumDevnet from "../assets.ethereum.sifchain-devnet.json";
import assetsEthereumTestnet from "../assets.ethereum.sifchain-testnet.json";
import assetsEthereumMainnet from "../assets.ethereum.mainnet.json";

import assetsSifchainLocalnet from "../assets.sifchain.localnet.json";
import assetsSifchainMainnet from "../assets.sifchain.mainnet.json";
import assetsSifchainDevnet from "../assets.sifchain.devnet";
import assetsCosmoshubTestnet from "../assets.cosmoshub.testnet";

import {
  parseConfig,
  parseAssets,
  ChainConfig,
  AssetConfig,
} from "../utils/parseConfig";
import { Asset, Network } from "../entities";
import { ServiceContext } from "../services";
import { NetworkEnv } from "./getEnv";

type ConfigMap = Record<NetworkEnv, ServiceContext>;
// type ChainNetwork = `${Network}.${NetworkEnv}`;
type ChainNetwork = string;
type AssetMap = Record<ChainNetwork, Asset[]>;

// Save assets for sync lookup throughout the app via Asset.get('symbol')
function cacheAsset(asset: Asset) {
  return Asset(asset);
}

export type AppConfig = ServiceContext; // Will include other injectables

export function getConfig(
  applicationNetworkEnv: NetworkEnv = NetworkEnv.LOCALNET,
  sifchainAssetTag: ChainNetwork = "sifchain.localnet",
  ethereumAssetTag: ChainNetwork = "ethereum.localnet",
  cosmoshubAssetTag: ChainNetwork = "cosmoshub.testnet",
): AppConfig {
  const assetMap: Partial<AssetMap> = {
    "sifchain.localnet": parseAssets(
      assetsSifchainLocalnet.assets as AssetConfig[],
    ),
    "sifchain.mainnet": parseAssets(
      assetsSifchainMainnet.assets as AssetConfig[],
    ),
    "sifchain.devnet": parseAssets([
      ...assetsSifchainDevnet.assets,
      ...assetsSifchainMainnet.assets,
    ] as AssetConfig[]),
    "ethereum.localnet": parseAssets(
      assetsEthereumLocalnet.assets as AssetConfig[],
    ),
    "ethereum.devnet": parseAssets(
      assetsEthereumDevnet.assets as AssetConfig[],
    ),
    "ethereum.testnet": parseAssets(
      assetsEthereumTestnet.assets as AssetConfig[],
    ),
    "ethereum.mainnet": parseAssets(
      assetsEthereumMainnet.assets as AssetConfig[],
    ),
  };

  const sifchainAssets = assetMap[sifchainAssetTag] || [];
  const ethereumAssets = assetMap[ethereumAssetTag] || [];
  const cosmoshubAssets = parseAssets(
    sifchainAssets.map((a) => ({
      ...a,
      network: Network.COSMOSHUB,
    })),
  );
  const allAssets = [
    ...sifchainAssets,
    ...ethereumAssets,
    ...cosmoshubAssets,
  ].map(cacheAsset);

  const configMap: ConfigMap = {
    localnet: parseConfig(localnetconfig as ChainConfig, allAssets),
    devnet: parseConfig(devnetconfig as ChainConfig, allAssets),
    devnet_042: parseConfig(devnet042config as ChainConfig, allAssets),
    testnet: parseConfig(testnetconfig as ChainConfig, allAssets),
    mainnet: parseConfig(mainnnetconfig as ChainConfig, allAssets),
    testnet_042_ibc: parseConfig(testnet042ibcconfig, allAssets),
  };

  return configMap[applicationNetworkEnv];
}
