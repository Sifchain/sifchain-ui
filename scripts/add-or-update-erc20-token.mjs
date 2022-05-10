#!/usr/bin/env zx

import Coingecko from "coingecko-api";
import Web3 from "web3";
import { uniqBy } from "ramda";
import path from "path";
import fs from "fs";

import { arg } from "./lib.mjs";
import { ERC20_ABI } from "./erc20TokenAbi.mjs";

const coingecko = new Coingecko();

const args = arg(
  {
    // args
    "--id": String,
    "--address": String,
    "--envs": String,
    // aliases
    "-id": "--id",
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

async function addOrUpdateToken(coinId, address = "", envs = []) {
  if (!envs.length) {
    throw new Error("At least one env is required");
  }

  try {
    const token = await getERC20Info(address);

    if (!coinId) {
      console.info(`coinId not provided, using token name: ${token.name}`);
    }

    const response = await coingecko.coins.fetch(
      coinId ?? token.name.toLowerCase(),
    );

    if (!response.code === 200) {
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
    //   "label": "Offshift",
    //   "imageUrl": "https://assets.coingecko.com/coins/images/11977/small/CsBrPiA.png?1614570441",
    //   "decommissioned": false
    // }

    const assetConfig = {
      address,
      symbol: response.data.symbol,
      displaySymbol: response.data.symbol,
      decimals: token.decimals,
      name: response.data.name,
      network: "ethereum",
      homeNetwork: "ethereum",
      label: response.data.name,
      imageUrl: response.data.image.small,
    };

    function updateNetwork(network, env) {
      console.log("updating network  asset", { network, env });

      const filePath = getAssetFilePath(network, env);

      const assetRaw = fs.readFileSync(filePath);

      const { assets } = JSON.parse(assetRaw);

      const nextAssets = uniqBy((x) => x.address, assets.concat(assetConfig));

      const file = JSON.stringify(
        {
          assets: nextAssets,
        },
        null,
        2,
      );

      fs.writeFileSync(filePath, file);
    }

    for (let env of envs) {
      await Promise.all(
        ["ethereum", "sifchain"].map((network) => updateNetwork(network, env)),
      );
    }
  } catch (error) {
    console.error(error);
  }
}

await addOrUpdateToken(
  args["--id"],
  args["--address"],
  (args["--envs"] ?? "").split(",").filter((env) => VALID_ENVS.includes(env)),
);
