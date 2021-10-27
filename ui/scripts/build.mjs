#!/usr/bin/env zx
import { resolve } from "path";
import { lint, setupStack } from "./lib.mjs";
// import { arg } from "./lib.mjs";

// const args = arg(
//   { "--no-setup": Boolean, "--tag": String, "-t:": "--tag" },
//   `
// Usage: 

//   yarn build

// Build the frontend to the ./app/dist folder. 

// Options: 

// --no-setup      Don't run the docker setup scripts. This can be useful when setup and ABI extraction has already occured say with vercel for example.
// --tag, -t       Tag to use for extracting assets such as contract ABIs
// `,
// );

// const noSetup = args["--no-setup"];
// const tagName = args["--tag"];

const core = resolve(__dirname, "../core");
const app = resolve(__dirname, "../app");

const sha = 'current' // await $`git rev-parse HEAD`
const version = require('../app/package.json').version

// if (!noSetup) {
//   await setupStack(tagName);
// }
await Promise.all([
 lint(),
 $`cd ${core} && yarn build`,
 $`cd ${app} && VITE_APP_VERSION=${version} VITE_APP_SHA=${sha} yarn build`
])
