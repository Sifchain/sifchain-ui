#!/usr/bin/env zx
import { resolve } from "path";
import { setupStack } from "./lib.mjs";
import { arg } from "./lib.mjs";

const args = arg(
  {
    "--tag": String,
    "-t": "--tag",
    "--unit": Boolean,
    "-u": "--unit",
    "--integration": Boolean,
    "-i": "--integration",
  },
  `
Usage: 

  yarn test

Run all the unit and integration test code within core. Some tests require backing services and will launch these services as they need them.

Options:
--unit, -u         Run Unit tests only.
--integration, -i  Run integration tests only.
--tag, -t          Run backing services with an image tag to use. Usually a stable tag ie. \`develop\` or a commit hash ie. \`649e35193c8ef0730458f058d52693b1a1ca5d77\`.
`,
);

async function runCoreTests(tag, isUnit, isIntegration) {
  const core = resolve(__dirname, "../core");

  await setupStack(tag);

  // Set the env var to run against a specific tag
  if (tag) process.env.STACK_TAG = tag;

  if (isUnit) {
    return await $`cd ${core} && yarn compile && yarn unit`;
  }

  if (isIntegration) {
    return await $`cd ${core} && yarn compile && yarn integration`;
  }

  return await $`cd ${core} && yarn compile && yarn unit`;
}

await runCoreTests(args["--tag"], args["--unit"], args["--integration"]);
