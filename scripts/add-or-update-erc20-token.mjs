#!/usr/bin/env zx

import Coingecko from "coingecko-api";
import Web3 from "web3";
import { uniqBy } from "ramda";
import path from "path";
import fs from "fs/promises";
import { createInterface } from "readline";

import { arg } from "./lib.mjs";
import { ERC20_ABI } from "./erc20TokenAbi.mjs";

const coingecko = new Coingecko();

/**
 *
 * @param {String} message
 * @returns {Promise<String>}
 */
const prompt = (message = "", options = ["y", "n"], defaultAnswer = "y") =>
  new Promise((resolve) => {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const body = `${message} [${options.join("/")}]`;

    rl.question(body, (answer) => {
      rl.close();

      if (options.includes(answer.toLowerCase())) {
        resolve(answer.toLowerCase());
      } else {
        resolve(defaultAnswer);
      }
    });
  });

const args = arg(
  {
    // args
    "--id": String,
    "--address": String,
    "--envs": String,
    // aliases
    "-i": "--id",
    "-e": "--envs",
    "-a": "--address",
  },
  `
Usage: 

  yarn add-or-update-token [--id <address>] [--envs <envs>]
`,
);

const VALID_ENVS = [
  "localnet",
  "devnet",
  "testnet",
  "mainnet",
  "sifchain-devnet",
  "sifchain-mainnet",
];

const web3 = new Web3(
  new Web3.providers.HttpProvider(
    "https://mainnet.infura.io/v3/93cd052103fd44bd9cf855654e5804ac",
  ),
);

async function getERC20Info(address = "") {
  const contract = new web3.eth.Contract(ERC20_ABI, address);

  const [decimals, tokenName, symbol] = await Promise.all([
    contract.methods.decimals().call(),
    contract.methods.name().call(),
    contract.methods.symbol().call(),
  ]);

  return {
    name: String(tokenName),
    symbol: String(symbol),
    decimals: Number(decimals),
  };
}

function getAssetFilePath(network, env) {
  const filePrefix = path.resolve(__dirname, "../core/src/config/networks");
  const filePath = `${filePrefix}/${network}/assets.${network}.${env}.json`;
  return filePath;
}

async function updateAssetByNetwork(network, env, assetConfig) {
  console.log("updating network  asset", { network, env });

  const filePath = getAssetFilePath(network, env);
  const assetRaw = await fs.readFile(filePath);
  const { assets } = JSON.parse(assetRaw);

  const existingAsset = assets.find(
    (asset) => asset.address === assetConfig.address,
  );

  if (existingAsset) {
    console.log("asset already exists", {
      network,
      env,
      address: assetConfig.address,
    });
  }

  const nextAssets = uniqBy((x) => x.symbol, assets.concat(assetConfig));

  const encodedFile = JSON.stringify({ assets: nextAssets }, null, 2);

  await fs.writeFile(filePath, encodedFile);

  console.log("updated network asset", { network, env });
  return;
}

async function addOrUpdateToken({ id = "", address = "", envs = [] }) {
  if (!envs.length) {
    throw new Error("At least one env is required");
  }

  if (!address) {
    throw new Error("Address is required");
  }

  try {
    const token = await getERC20Info(address);

    console.log("token", token);

    const coinInfo = await coingecko.coins.fetchCoinContractInfo(address);

    const coinId = coinInfo?.data?.id;

    if (!coinId) {
      throw new Error("Coin id is not found for address", { address });
    }

    const response = await coingecko.coins.fetch(coinId);

    if (response.code !== 200) {
      console.log("something went weird", {
        code: response.code,
        message: response.message,
      });
    }

    // Example asset entry:
    // {
    //   "address": "0xABe580E7ee158dA464b51ee1a83Ac0289622e6be",
    //   "symbol": "xft",
    //   "displaySymbol": "xft",
    //   "decimals": 18,
    //   "name": "Offshift",
    //   "network": "ethereum",
    //   "homeNetwork": "ethereum",
    //   "imageUrl": "https://assets.coingecko.com/coins/images/11977/small/CsBrPiA.png?1614570441"
    // }

    const ethAssetConfig = {
      address,
      symbol: response.data.symbol,
      displaySymbol: response.data.symbol,
      decimals: token.decimals,
      name: response.data.name,
      network: "ethereum",
      homeNetwork: "ethereum",
      imageUrl: response.data.image.small,
    };

    const sifAssetConfig = {
      ...ethAssetConfig,
      network: "sifchain",
      symbol: `c${ethAssetConfig.symbol}`,
    };

    console.log("Asset config preview:", {
      "EVM config": ethAssetConfig,
      "Sifchain config": sifAssetConfig,
    });

    const { name, symbol } = ethAssetConfig;

    const answer = await prompt(
      `Add "${name}" (${symbol.toUpperCase()}) to envs (${envs.join(", ")})?`,
      ["y", "n"],
      "y",
    );

    if (answer !== "y") {
      console.log("maybe next time");
      return;
    }

    for (let env of envs) {
      const promises = ["ethereum", "sifchain"].map((network) => {
        const assetConfig =
          network === "ethereum" ? ethAssetConfig : sifAssetConfig;

        return updateAssetByNetwork(network, env, assetConfig);
      });
      await Promise.all(promises);
    }
  } catch (error) {
    console.error(error);
  }
}

await addOrUpdateToken({
  id: args["--id"],
  address: args["--address"],
  envs: (args["--envs"] ?? "")
    .split(",")
    .filter((env) => VALID_ENVS.includes(env)),
});
