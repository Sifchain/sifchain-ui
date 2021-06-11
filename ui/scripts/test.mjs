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
    "--watch": Boolean,
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

async function runCoreTests(
  tag = "develop",
  isUnit,
  isIntegration,
  isWatch,
  rest,
) {
  const core = resolve(__dirname, "../core");

  // Idea here is to avoid doing any docker things when we are only running unit tests
  if (
    isIntegration ||
    (typeof isIntegration === "undefined" && typeof isUnit === "undefined")
  )
    await setupStack(tag);

  // Set the env var to run against a specific tag
  if (tag) process.env.STACK_TAG = tag;

  const testArgs = isWatch ? [...rest, "--watch"] : rest;

  if (isUnit) {
    return await $`cd ${core} && yarn compile && yarn unit ${testArgs}`;
  }

  if (isIntegration) {
    return await $`cd ${core} && yarn compile && yarn integration ${testArgs}`;
  }

  return await $`cd ${core} && yarn compile && yarn test ${testArgs}`;
}

await runCoreTests(
  args["--tag"] || "develop",
  args["--unit"],
  args["--integration"],
  args["--watch"],
  args._.slice(1),
);
