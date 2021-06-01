#!/usr/bin/env zx
import { resolve } from "path";
import { lint, setupStack } from "./lib.mjs";
import { arg } from "./lib.mjs";

const args = arg(
  { "--no-setup": Boolean },
  `
Usage: 

  yarn build

Build the frontend to the ./app/dist folder. 

Options: 

--no-setup - Don't run the docker setup scripts. This can be useful when setup and ABI extraction has already occured say with vercel for example.

`,
);

const core = resolve(__dirname, "../core");
const app = resolve(__dirname, "../app");

if (!args["--no-setup"]) {
  await setupStack();
}
await lint();
await $`cd ${core} && yarn build`;
await $`cd ${app} && yarn build`;
