#!/usr/bin/env zx
import { arg } from "./lib.mjs";

const args = arg(
  { "--build": Boolean, "-b": "--build" },
  `
Normal Mode Usage:

  yarn storybook

Start storybook on port http://localhost:6006

Build Mode Usage:
  yarn storybook --build
  yarn storybook -b

Build a deployable storybook instance under "./storybook-static"
`,
);

const isBuildRequested = args["--build"];

if (isBuildRequested) {
  await $`build-storybook`;
} else {
  await $`start-storybook -p 6006`;
}
