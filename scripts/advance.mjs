#!/usr/bin/env zx

// Making this mjs file to use with zx

import helpers from "@openzeppelin/test-helpers";
import configure from "@openzeppelin/test-helpers/configure.js";
import Web3 from "web3";
import { arg } from "./lib.mjs";

const args = arg(
  {},
  `
Usage: 

  yarn advance [blocks:number]

Advance the ethereum blockchain by the given amount of blocks. 

`,
);

const { time } = helpers;

const provider = new Web3.providers.HttpProvider("http://localhost:7545");

const web3 = new Web3(provider);

async function advanceBlock(count) {
  configure({ provider });
  console.log("Advancing time by " + count + " blocks");
  console.log(`Current block number is ${await web3.eth.getBlockNumber()}`);
  for (let i = 0; i < count; i++) {
    await time.advanceBlock();
  }

  console.log(`New block number is ${await web3.eth.getBlockNumber()}`);
  console.log("Finished advancing time.");
}

// First general argument
const [count] = args._.slice(-1);

await advanceBlock(count);
