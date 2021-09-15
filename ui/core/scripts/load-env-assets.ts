import Web3 from "web3";
import fs from "fs";
import path from "path";

import { NetworkEnv, IAsset, Network } from "../src";
import { loadAssets } from "../src/clients/assetLoader";

export const loadEnvAssets = async (networkEnv: NetworkEnv) => {
  const providerUrl =
    networkEnv === NetworkEnv.MAINNET
      ? "https://mainnet.infura.io/v3/7bf7bd5d44fd4f5eb081b580df2a2121"
      : "https://ropsten.infura.io/v3/7bf7bd5d44fd4f5eb081b580df2a2121";

  return loadAssets(
    networkEnv,
    async () => new Web3.providers.HttpProvider(providerUrl),
  );
};

const assetFilenameLookup: Record<NetworkEnv, string> = {
  [NetworkEnv.LOCALNET]: "assets-localnet",
  [NetworkEnv.DEVNET]: "assets-devnet",
  [NetworkEnv.DEVNET_042]: "assets-devnet-042",
  [NetworkEnv.TESTNET_042_IBC]: "assets-testnet-042-ibc",
  [NetworkEnv.TESTNET]: "assets-testnet",
  [NetworkEnv.MAINNET]: "assets-mainnet",
};

export default async (env: keyof typeof NetworkEnv) => {
  console.log("loadEnvAssets", env);
  const networkEnv = NetworkEnv[env];
  const assets = await loadEnvAssets(networkEnv);

  const assetsFolder = path.join(__dirname, `../src/generated/assets`);

  fs.writeFileSync(
    path.join(assetsFolder, assetFilenameLookup[networkEnv] + `.native.json`),
    JSON.stringify(assets.native, null, 2),
  );
  fs.writeFileSync(
    path.join(assetsFolder, assetFilenameLookup[networkEnv] + `.ethereum.json`),
    JSON.stringify(assets.ethereum, null, 2),
  );
};
