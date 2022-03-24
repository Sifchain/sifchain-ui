"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConfig = void 0;
// TODO - Conditional load or build-time tree shake
const config_localnet_json_1 = __importDefault(require("./networks/sifchain/config.localnet.json"));
const config_devnet_json_1 = __importDefault(require("./networks/sifchain/config.devnet.json"));
const config_devnet_042_json_1 = __importDefault(require("./networks/sifchain/config.devnet-042.json"));
const config_testnet_042_ibc_json_1 = __importDefault(require("./networks/sifchain/config.testnet-042-ibc.json"));
const config_testnet_json_1 = __importDefault(require("./networks/sifchain/config.testnet.json"));
const config_mainnet_json_1 = __importDefault(require("./networks/sifchain/config.mainnet.json"));
const assets_ethereum_localnet_json_1 = __importDefault(require("./networks/ethereum/assets.ethereum.localnet.json"));
const assets_ethereum_sifchain_devnet_json_1 = __importDefault(require("./networks/ethereum/assets.ethereum.sifchain-devnet.json"));
const assets_ethereum_sifchain_testnet_json_1 = __importDefault(require("./networks/ethereum/assets.ethereum.sifchain-testnet.json"));
const assets_ethereum_sifchain_testnet_042_json_1 = __importDefault(require("./networks/ethereum/assets.ethereum.sifchain-testnet-042.json"));
const assets_ethereum_mainnet_json_1 = __importDefault(require("./networks/ethereum/assets.ethereum.mainnet.json"));
const assets_sifchain_localnet_1 = __importDefault(require("./networks/sifchain/assets.sifchain.localnet"));
const assets_sifchain_mainnet_1 = __importDefault(require("./networks/sifchain/assets.sifchain.mainnet"));
const assets_sifchain_devnet_1 = __importDefault(require("./networks/sifchain/assets.sifchain.devnet"));
const parseConfig_1 = require("../utils/parseConfig");
const entities_1 = require("../entities");
const getEnv_1 = require("./getEnv");
const chains_1 = require("./chains");
// Save assets for sync lookup throughout the app via Asset.get('symbol')
function cacheAsset(asset) {
    return (0, entities_1.Asset)(asset);
}
function getConfig(applicationNetworkEnv = getEnv_1.NetworkEnv.LOCALNET, sifchainAssetTag = "sifchain.localnet", ethereumAssetTag = "ethereum.localnet") {
    const assetMap = {
        "sifchain.localnet": (0, parseConfig_1.parseAssets)(assets_sifchain_localnet_1.default.assets),
        "sifchain.mainnet": (0, parseConfig_1.parseAssets)(assets_sifchain_mainnet_1.default.assets),
        "sifchain.devnet": (0, parseConfig_1.parseAssets)(assets_sifchain_devnet_1.default.assets),
        "ethereum.localnet": (0, parseConfig_1.parseAssets)(assets_ethereum_localnet_json_1.default.assets),
        "ethereum.devnet": (0, parseConfig_1.parseAssets)(assets_ethereum_sifchain_devnet_json_1.default.assets),
        "ethereum.testnet": (0, parseConfig_1.parseAssets)(assets_ethereum_sifchain_testnet_json_1.default.assets),
        "ethereum.testnet_042_ibc": (0, parseConfig_1.parseAssets)(assets_ethereum_sifchain_testnet_042_json_1.default.assets),
        "ethereum.mainnet": (0, parseConfig_1.parseAssets)(assets_ethereum_mainnet_json_1.default.assets),
    };
    const sifchainAssets = assetMap[sifchainAssetTag] || [];
    const ethereumAssets = assetMap[ethereumAssetTag] || [];
    let allAssets = [...sifchainAssets, ...ethereumAssets];
    Object.values(entities_1.Network)
        .filter((n) => n !== entities_1.Network.ETHEREUM && n !== entities_1.Network.SIFCHAIN)
        .forEach((n) => {
        allAssets.push(...sifchainAssets.map((a) => (Object.assign(Object.assign({}, a), { network: n }))));
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
        localnet: (0, parseConfig_1.parseConfig)(config_localnet_json_1.default, allAssets, chains_1.chainConfigByNetworkEnv[getEnv_1.NetworkEnv.LOCALNET], peggyCompatibleCosmosBaseDenoms),
        devnet: (0, parseConfig_1.parseConfig)(config_devnet_json_1.default, allAssets, chains_1.chainConfigByNetworkEnv[getEnv_1.NetworkEnv.DEVNET], peggyCompatibleCosmosBaseDenoms),
        devnet_042: (0, parseConfig_1.parseConfig)(config_devnet_042_json_1.default, allAssets, chains_1.chainConfigByNetworkEnv[getEnv_1.NetworkEnv.DEVNET_042], peggyCompatibleCosmosBaseDenoms),
        testnet: (0, parseConfig_1.parseConfig)(config_testnet_json_1.default, allAssets, chains_1.chainConfigByNetworkEnv[getEnv_1.NetworkEnv.TESTNET], peggyCompatibleCosmosBaseDenoms),
        mainnet: (0, parseConfig_1.parseConfig)(config_mainnet_json_1.default, allAssets, chains_1.chainConfigByNetworkEnv[getEnv_1.NetworkEnv.MAINNET], peggyCompatibleCosmosBaseDenoms),
        testnet_042_ibc: (0, parseConfig_1.parseConfig)(config_testnet_042_ibc_json_1.default, allAssets, chains_1.chainConfigByNetworkEnv[getEnv_1.NetworkEnv.TESTNET_042_IBC], peggyCompatibleCosmosBaseDenoms),
    };
    const currConfig = configMap[applicationNetworkEnv];
    return currConfig;
}
exports.getConfig = getConfig;
//# sourceMappingURL=getConfig.js.map