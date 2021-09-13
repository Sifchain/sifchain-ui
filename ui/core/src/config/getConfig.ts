// TODO - Conditional load or build-time tree shake
import localnetconfig from "./networks/sifchain/config.localnet.json";
import devnetconfig from "./networks/sifchain/config.devnet.json";
import devnet042config from "./networks/sifchain/config.devnet-042.json";
import testnet042ibcconfig from "./networks/sifchain/config.testnet-042-ibc.json";
import testnetconfig from "./networks/sifchain/config.testnet.json";
import mainnnetconfig from "./networks/sifchain/config.mainnet.json";

import assetsSifchainDevnet from "../generated/assets/assets-devnet.native.json";
import assetsSifchainMainnet from "../generated/assets/assets-devnet.native.json";

import assetsEthereumDevnet from "../generated/assets/assets-devnet.ethereum.json";
import assetsEthereumTestnet from "../generated/assets/assets-testnet.ethereum.json";
import assetsEthereumTestnet042 from "../generated/assets/assets-testnet-042-ibc.ethereum.json";
import assetsEthereumMainnet from "../generated/assets/assets-mainnet.ethereum.json";

import {
  parseConfig,
  parseAssets,
  CoreConfig,
  AssetConfig,
} from "../utils/parseConfig";
import { Asset, Network } from "../entities";
import { ServiceContext } from "../services";
import { NetworkEnv } from "./getEnv";
import { chainConfigByNetworkEnv } from "./chains";

type ConfigMap = Record<NetworkEnv, ServiceContext>;

// type ChainNetwork = `${Network}.${NetworkEnv}`;
type ChainNetwork = string;
type AssetMap = Record<ChainNetwork, Asset[]>;

// Save assets for sync lookup throughout the app via Asset.get('symbol')
function cacheAsset(asset: Asset) {
  return Asset(asset);
}

export const configMapByNetworkEnv: Record<NetworkEnv, CoreConfig> = {
  [NetworkEnv.LOCALNET]: localnetconfig,
  [NetworkEnv.DEVNET]: devnetconfig,
  [NetworkEnv.DEVNET_042]: devnet042config,
  [NetworkEnv.TESTNET_042_IBC]: testnet042ibcconfig,
  [NetworkEnv.TESTNET]: testnetconfig,
  [NetworkEnv.MAINNET]: mainnnetconfig,
};

export type AppConfig = ServiceContext; // Will include other injectables

export function getConfig(
  applicationNetworkEnv: NetworkEnv = NetworkEnv.LOCALNET,
  sifchainAssetTag: ChainNetwork = "sifchain.localnet",
  ethereumAssetTag: ChainNetwork = "ethereum.localnet",
): AppConfig {
  const peggyCompatibleCosmosBaseDenoms = new Set([
    "uiris",
    "uatom",
    "uxprt",
    "uakt",
    "hard",
    "uregen",
    "ukava",
    "uosmo",
    "uion",
    // not sure if these contracts actually exist
    "uphoton",
    "unyan",
  ]);
  const assetMap: Partial<AssetMap> = {
    // "sifchain.localnet": parseAssets(
    //   assetsSifchainLocalnet as AssetConfig[],
    // ),
    "sifchain.mainnet": parseAssets(assetsSifchainMainnet as AssetConfig[]),
    "sifchain.devnet": parseAssets(assetsSifchainDevnet as AssetConfig[]),
    // "ethereum.localnet": parseAssets(
    //   assetsEthereumLocalnet as AssetConfig[],
    // ),
    "ethereum.devnet": parseAssets(assetsEthereumDevnet as AssetConfig[]),
    "ethereum.testnet": parseAssets(assetsEthereumTestnet as AssetConfig[]),
    "ethereum.testnet_042_ibc": parseAssets(
      assetsEthereumTestnet042 as AssetConfig[],
    ),
    "ethereum.mainnet": parseAssets(assetsEthereumMainnet as AssetConfig[]),
  };

  const sifchainAssets = assetMap[sifchainAssetTag] || [];
  const ethereumAssets = assetMap[ethereumAssetTag] || [];

  let allAssets = [...sifchainAssets, ...ethereumAssets];

  // const sifchainAssetSymbols = new Set(sifchainAssets.map(a => a.symbol))
  Object.values(Network)
    .filter((n) => n !== Network.ETHEREUM && n !== Network.SIFCHAIN)
    .forEach((n) => {
      allAssets.push(
        ...sifchainAssets.map((a) => ({
          ...a,
          network: n,
        })),
      );
    });

  allAssets = allAssets.map(cacheAsset);

  const coreConfig = configMapByNetworkEnv[applicationNetworkEnv];

  const configMap: ConfigMap = {
    localnet: parseConfig(
      coreConfig,
      allAssets,
      chainConfigByNetworkEnv[NetworkEnv.LOCALNET],
      peggyCompatibleCosmosBaseDenoms,
    ),
    devnet: parseConfig(
      coreConfig,
      allAssets,
      chainConfigByNetworkEnv[NetworkEnv.DEVNET],
      peggyCompatibleCosmosBaseDenoms,
    ),
    devnet_042: parseConfig(
      coreConfig,
      allAssets,
      chainConfigByNetworkEnv[NetworkEnv.DEVNET_042],
      peggyCompatibleCosmosBaseDenoms,
    ),
    testnet: parseConfig(
      coreConfig,
      allAssets,
      chainConfigByNetworkEnv[NetworkEnv.TESTNET],
      peggyCompatibleCosmosBaseDenoms,
    ),
    mainnet: parseConfig(
      coreConfig,
      allAssets,
      chainConfigByNetworkEnv[NetworkEnv.MAINNET],
      peggyCompatibleCosmosBaseDenoms,
    ),
    testnet_042_ibc: parseConfig(
      coreConfig,
      allAssets,
      chainConfigByNetworkEnv[NetworkEnv.TESTNET_042_IBC],
      peggyCompatibleCosmosBaseDenoms,
    ),
  };

  const currConfig = configMap[applicationNetworkEnv];
  console.log({ currConfig });
  return currConfig;
}
