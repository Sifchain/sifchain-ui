#!/usr/bin/env zx

import { e2eTest, e2eTestDebug, serveBuiltApp, race, waitOn } from "./lib.mjs";
import { arg } from "./lib.mjs";

const args = arg(
  { "--debug": Boolean },
  `
Normal mode: 

  yarn e2e

This mode is best for running e2e tests in a CI situation. 
1. Run a server that points to the built code under ./app/dist and serve it on http://localhost:5000. 
2. Concurrently run all e2e tests within ./e2e against that server. 
3. Every test will automatically restart it's backing server and reset the backing server's state.

Single test mode:

  yarn e2e --debug

This mode is best for authoring and selecting individual tests.
1. Run e2e tests ONLY. Test will run in debug mode with no other services starting up concurrently
`,
);

const isDebug = args["--debug"];

// Only run test script
if (isDebug) {
  await e2eTestDebug();
  process.exit(0);
}

// Run server and test script concurrently
await race(
  serveBuiltApp(),
  waitOn("http://localhost:5000").then(() => {
    process.env.PORT = "5000";
    return e2eTest();
  }),
);
