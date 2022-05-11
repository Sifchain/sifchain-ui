// TODO - Conditional load or build-time tree shake
import localnetconfig from "./networks/sifchain/config.localnet.json";
import devnetconfig from "./networks/sifchain/config.devnet.json";

import testnetconfig from "./networks/sifchain/config.testnet.json";
import mainnnetconfig from "./networks/sifchain/config.mainnet.json";

import assetsEthereumLocalnet from "./networks/ethereum/assets.ethereum.localnet.json";
import assetsEthereumMainnet from "./networks/ethereum/assets.ethereum.mainnet.json";
import assetsEthereumDevnet from "./networks/ethereum/assets.ethereum.devnet.json";
import assetsEthereumTestnet from "./networks/ethereum/assets.ethereum.testnet.json";

import assetsSifchainLocalnet from "./networks/sifchain/assets.sifchain.localnet.json";
import assetsSifchainMainnet from "./networks/sifchain/assets.sifchain.mainnet.json";
import assetsSifchainDevnet from "./networks/sifchain/assets.sifchain.devnet.json";

import {
  parseConfig,
  parseAssets,
  CoreConfig,
  AssetConfig,
} from "../utils/parseConfig";
import { Network, IAsset } from "../entities";
import { NetworkEnv } from "./getEnv";
import { chainConfigByNetworkEnv } from "./chains";

type ConfigMap = Record<NetworkEnv, ReturnType<typeof parseConfig>>;

type ChainNetwork = `${Network}.${NetworkEnv}`;

type AssetMap = Record<ChainNetwork, IAsset[]>;

export type AppConfig = ReturnType<typeof parseConfig>; // Will include other injectables

export function getConfig(
  applicationNetworkEnv: NetworkEnv = NetworkEnv.LOCALNET,
  sifchainAssetTag: ChainNetwork = "sifchain.localnet",
  ethereumAssetTag: ChainNetwork = "ethereum.localnet",
): AppConfig {
  const assetMap: Partial<AssetMap> = {
    "sifchain.localnet": parseAssets(
      assetsSifchainLocalnet.assets as AssetConfig[],
    ),
    "sifchain.mainnet": parseAssets(
      assetsSifchainMainnet.assets as AssetConfig[],
    ),
    "sifchain.devnet": parseAssets(
      assetsSifchainDevnet.assets as AssetConfig[],
    ),
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

  if (process.env.NODE_ENV === "development") {
    console.log(
      "Using development config",
      applicationNetworkEnv,
      sifchainAssetTag,
      ethereumAssetTag,
      {
        sifchainAssets,
        ethereumAssets,
      },
    );
  }

  const allAssets = [...sifchainAssets, ...ethereumAssets];

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

  const peggyCompatibleCosmosBaseDenoms = new Set([
    "uiris",
    "uatom",
    "uxprt",
    "ukava",
    "uakt",
    "hard",
    "uosmo",
    "uregen",
    "uion",
    "uixo",
    "ujuno",
    "udvpn",
    // not sure if these contracts actually exist
    "uphoton",
    "unyan",
  ]);
  const configMap: ConfigMap = {
    localnet: parseConfig(
      localnetconfig as CoreConfig,
      allAssets,
      chainConfigByNetworkEnv[NetworkEnv.LOCALNET],
      peggyCompatibleCosmosBaseDenoms,
    ),
    devnet: parseConfig(
      devnetconfig as CoreConfig,
      allAssets,
      chainConfigByNetworkEnv[NetworkEnv.DEVNET],
      peggyCompatibleCosmosBaseDenoms,
    ),
    testnet: parseConfig(
      testnetconfig as CoreConfig,
      allAssets,
      chainConfigByNetworkEnv[NetworkEnv.TESTNET],
      peggyCompatibleCosmosBaseDenoms,
    ),
    mainnet: parseConfig(
      mainnnetconfig as CoreConfig,
      allAssets,
      chainConfigByNetworkEnv[NetworkEnv.MAINNET],
      peggyCompatibleCosmosBaseDenoms,
    ),
  };

  const currConfig = configMap[applicationNetworkEnv];

  return currConfig;
}
