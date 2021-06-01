#!/usr/bin/env zx
import { resolve } from "path";
import { setupStack } from "./lib.mjs";
import { arg } from "./lib.mjs";

arg(
  {},
  `
Usage: 

  yarn test

Run all the unit and integration test code within core. Some tests require backing services and will launch these services as they need them.

`,
);

const core = resolve(__dirname, "../core");

await setupStack();
await $`cd ${core} && yarn compile && yarn test`;
