#!/usr/bin/env zx
import { resolve } from "path";
import { serveBuiltApp, setupStack, waitOn } from "./lib.mjs";
import { arg } from "./lib.mjs";

const args = arg(
  { "--debug": Boolean, "--tag": String, "-t": "--tag" },
  `
Normal mode: 

  yarn e2e
  yarn e2e --tag develop

This mode is best for running e2e tests in a CI situation. 
1. Run a server that points to the built code under ./app/dist and serve it on http://localhost:5000. 
2. Concurrently run all e2e tests within ./e2e against that server. 
3. Every test will automatically restart it's backing server and reset the backing server's state.

Single test mode:

  yarn e2e --debug

This mode is best for authoring and selecting individual tests.
1. Run e2e tests ONLY. Test will run in debug mode with no other services starting up concurrently

Options:
--debug     Run e2e tests in debug mode without backing services
--tag, -t   Run backing services with an image tag to use. Usually a stable tag ie. \`develop\` or a commit hash ie. \`649e35193c8ef0730458f058d52693b1a1ca5d77\`
`,
);

const isDebug = args["--debug"];
const tagName = args["--tag"] || "develop";

// Only run test script
if (isDebug) {
  await $`cd e2e && DEBUG=pw:api NOSTACK=1 ./scripts/test.sh`;
  process.exit(0);
}

async function runTests(tag) {
  await waitOn("http://localhost:5000");

  await setupStack(tag);

  process.env.PORT = "5000";

  // Set the env var to run against a specific tag
  if (tag) process.env.STACK_TAG = tag;

  const e2e = resolve(__dirname, "../e2e");

  return await $`cd ${e2e} && ./scripts/test.sh`;
}

const buildPath = resolve(__dirname, "../app/dist/index.html");

try {
  await fs.stat(buildPath);
} catch (err) {
  console.log(
    `${chalk.red(
      "Error",
    )} Could not find a build under (./app/dist). Did you forget to run \`yarn build\` ?`,
  );
  process.exit(1);
}

// Run server and test script concurrently
await Promise.all([serveBuiltApp(), runTests(tagName)]);
