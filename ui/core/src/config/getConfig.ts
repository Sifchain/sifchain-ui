// TODO - Conditional load or build-time tree shake
import localnetconfig from "./networks/sifchain/config.localnet.json";
import devnetconfig from "./networks/sifchain/config.devnet.json";
import devnet042config from "./networks/sifchain/config.devnet-042.json";
import testnet042ibcconfig from "./networks/sifchain/config.testnet-042-ibc.json";
import testnetconfig from "./networks/sifchain/config.testnet.json";
import mainnnetconfig from "./networks/sifchain/config.mainnet.json";

import assetsEthereumLocalnet from "./networks/ethereum/assets.ethereum.localnet.json";
import assetsEthereumDevnet from "./networks/ethereum/assets.ethereum.sifchain-devnet.json";
import assetsEthereumTestnet from "./networks/ethereum/assets.ethereum.sifchain-testnet.json";
import assetsEthereumTestnet042IBC from "./networks/ethereum/assets.ethereum.sifchain-testnet-042.json";
import assetsEthereumMainnet from "./networks/ethereum/assets.ethereum.mainnet.json";

import assetsSifchainLocalnet from "./networks/sifchain/assets.sifchain.localnet.json";
import assetsSifchainMainnet from "./networks/sifchain/assets.sifchain.mainnet.json";
import assetsExternalTestnet from "./networks/sifchain/assets.external.testnet";
import assetsExternalMainnet from "./networks/sifchain/assets.external.mainnet";

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
    "sifchain.mainnet": parseAssets([
      ...assetsExternalMainnet.assets,
      ...assetsSifchainMainnet.assets,
    ] as AssetConfig[]),
    "sifchain.devnet": parseAssets([
      ...assetsExternalTestnet.assets,
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
    "ethereum.testnet_042_ibc": parseAssets(
      assetsEthereumTestnet042IBC.assets as AssetConfig[],
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
  // const irisAssets = parseAssets(
  //   sifchainAssets.map((a) => ({
  //     ...a,
  //     network: Network.IRIS,
  //   })),
  // );
  const akashAssets = parseAssets(
    sifchainAssets.map((a) => ({
      ...a,
      network: Network.AKASH,
    })),
  );
  const sentinelAssets = parseAssets(
    sifchainAssets.map((a) => ({
      ...a,
      network: Network.SENTINEL,
    })),
  );
  const allAssets = [
    ...sifchainAssets,
    ...ethereumAssets,
    ...cosmoshubAssets,
    // ...irisAssets,
    ...akashAssets,
    ...sentinelAssets,
  ].map(cacheAsset);

  const configMap: ConfigMap = {
    localnet: parseConfig(
      localnetconfig as CoreConfig,
      allAssets,
      chainConfigByNetworkEnv[NetworkEnv.LOCALNET],
    ),
    devnet: parseConfig(
      devnetconfig as CoreConfig,
      allAssets,
      chainConfigByNetworkEnv[NetworkEnv.DEVNET],
    ),
    devnet_042: parseConfig(
      devnet042config as CoreConfig,
      allAssets,
      chainConfigByNetworkEnv[NetworkEnv.DEVNET_042],
    ),
    testnet: parseConfig(
      testnetconfig as CoreConfig,
      allAssets,
      chainConfigByNetworkEnv[NetworkEnv.TESTNET],
    ),
    mainnet: parseConfig(
      mainnnetconfig as CoreConfig,
      allAssets,
      chainConfigByNetworkEnv[NetworkEnv.MAINNET],
    ),
    testnet_042_ibc: parseConfig(
      testnet042ibcconfig as CoreConfig,
      allAssets,
      chainConfigByNetworkEnv[NetworkEnv.TESTNET_042_IBC],
    ),
  };

  const currConfig = configMap[applicationNetworkEnv];
  console.log({ currConfig });
  return currConfig;
}
