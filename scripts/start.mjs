#!/usr/bin/env zx

import { serveBuiltApp } from "./lib.mjs";
import { arg } from "./lib.mjs";

arg(
  {},
  `
Usage: 

  yarn start

Serve the built app under ./app/dist on http://localhost:5000

You can change the port the app is served on by using the "PORT" env var:

  PORT=5432 yarn start

`,
);
await serveBuiltApp();
