#!/usr/bin/env zx
import { resolve } from "path";
import { lint, setupStack as _setupStack } from "./lib.mjs";
import { arg } from "./lib.mjs";

const args = arg({
  "--no-setup": Boolean,
  "--tag": String,
  "-t:": "--tag",
  "--skip-lint": Boolean,
});

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

const skipLint = args["--skip-lint"];

const core = resolve(__dirname, "../core");
const app = resolve(__dirname, "../app");

const sha = await $`git rev-parse HEAD`;
const version = require("../app/package.json").version;

// if (!noSetup) {
//   await setupStack(tagName);
// }

const buildSteps = [
  $`cd ${core} && yarn build`,
  $`cd ${app} && VITE_APP_VERSION=${version} VITE_APP_SHA=${sha} yarn build`,
];

const steps = skipLint ? [...buildSteps] : [lint(), ...buildSteps];

await Promise.all(steps);
