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
import assetsSifchainLocalnet from "./networks/sifchain/assets.sifchain.localnet";
import assetsSifchainMainnet from "./networks/sifchain/assets.sifchain.mainnet";
import assetsSifchainDevnet from "./networks/sifchain/assets.sifchain.devnet";
import { parseConfig, parseAssets } from "../utils/parseConfig";
import { Asset, Network } from "../entities";
import { NetworkEnv } from "./getEnv";
import { chainConfigByNetworkEnv } from "./chains";
// Save assets for sync lookup throughout the app via Asset.get('symbol')
function cacheAsset(asset) {
  return Asset(asset);
}
export function getConfig(
  applicationNetworkEnv = NetworkEnv.LOCALNET,
  sifchainAssetTag = "sifchain.localnet",
  ethereumAssetTag = "ethereum.localnet",
) {
  const assetMap = {
    "sifchain.localnet": parseAssets(assetsSifchainLocalnet.assets),
    "sifchain.mainnet": parseAssets(assetsSifchainMainnet.assets),
    "sifchain.devnet": parseAssets(assetsSifchainDevnet.assets),
    "ethereum.localnet": parseAssets(assetsEthereumLocalnet.assets),
    "ethereum.devnet": parseAssets(assetsEthereumDevnet.assets),
    "ethereum.testnet": parseAssets(assetsEthereumTestnet.assets),
    "ethereum.testnet_042_ibc": parseAssets(assetsEthereumTestnet042IBC.assets),
    "ethereum.mainnet": parseAssets(assetsEthereumMainnet.assets),
  };
  const sifchainAssets = assetMap[sifchainAssetTag] || [];
  const ethereumAssets = assetMap[ethereumAssetTag] || [];
  let allAssets = [...sifchainAssets, ...ethereumAssets];
  Object.values(Network)
    .filter((n) => n !== Network.ETHEREUM && n !== Network.SIFCHAIN)
    .forEach((n) => {
      allAssets.push(
        ...sifchainAssets.map((a) =>
          Object.assign(Object.assign({}, a), { network: n }),
        ),
      );
    });
  allAssets = allAssets.map(cacheAsset);
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
  const configMap = {
    localnet: parseConfig(
      localnetconfig,
      allAssets,
      chainConfigByNetworkEnv[NetworkEnv.LOCALNET],
      peggyCompatibleCosmosBaseDenoms,
    ),
    devnet: parseConfig(
      devnetconfig,
      allAssets,
      chainConfigByNetworkEnv[NetworkEnv.DEVNET],
      peggyCompatibleCosmosBaseDenoms,
    ),
    devnet_042: parseConfig(
      devnet042config,
      allAssets,
      chainConfigByNetworkEnv[NetworkEnv.DEVNET_042],
      peggyCompatibleCosmosBaseDenoms,
    ),
    testnet: parseConfig(
      testnetconfig,
      allAssets,
      chainConfigByNetworkEnv[NetworkEnv.TESTNET],
      peggyCompatibleCosmosBaseDenoms,
    ),
    mainnet: parseConfig(
      mainnnetconfig,
      allAssets,
      chainConfigByNetworkEnv[NetworkEnv.MAINNET],
      peggyCompatibleCosmosBaseDenoms,
    ),
    testnet_042_ibc: parseConfig(
      testnet042ibcconfig,
      allAssets,
      chainConfigByNetworkEnv[NetworkEnv.TESTNET_042_IBC],
      peggyCompatibleCosmosBaseDenoms,
    ),
  };
  const currConfig = configMap[applicationNetworkEnv];
  return currConfig;
}
//# sourceMappingURL=getConfig.js.map
