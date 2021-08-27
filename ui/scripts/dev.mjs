#!/usr/bin/env zx
import { resolve } from "path";
import { arg } from "./lib.mjs";

arg(
  {},
  `
Usage: 

  yarn dev

Run a development server with hotloading and code watch from http://localhost:8080. 

`,
);
const core = resolve(__dirname, "../core");
const app = resolve(__dirname, "../app");

await Promise.all([
  $`cd ${app} && rm -rf ./node_modules/.cache/ && yarn serve`,
  $`cd ${core} && yarn watch`,
]);
