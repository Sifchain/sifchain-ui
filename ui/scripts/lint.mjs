#!/usr/bin/env zx

import { lint, lintQuick } from "./lib.mjs";
import { arg } from "./lib.mjs";

const args = arg(
  { "--quick": Boolean, "-q": "--quick" },
  `
Usage: 

  yarn lint [options]

Lint the code. 

Options:

--quick --q - Use pretty-quick to only lint git staged code
`,
);

const isQuickMode = args["--quick"];

if (isQuickMode) {
  await lintQuick();
} else {
  await lint();
}
