#!/usr/bin/env zx

import { dockerLoggedIn, setupStack, runStack, killStack } from "./lib.mjs";

import { arg } from "./lib.mjs";

const args = arg(
  { "--kill": Boolean, "-k": "--kill", "--setup-only": Boolean },
  `
Usage: 

  yarn stack [options]

Manages our stack docker container. When run this starts all backing services the frontend needs to be tested locally. This includes the following and may include more in the future:

* sifnode rest server http://localhost:1317
* sifnode rpc server  http://localhost:26657
* ethereum node       http://localhost:7545
* ebrelayer           --

Our docker container is built under sifchain/ui-stack which is published per commit hash merged to either master or develop of the "sifnode" repo.  The default docker image that this command launches is given under "./scripts/latest" 

Options:

--kill --k - Kill any stack processes and remove all existing docker ui-stack containers 
--setup-only - This only pulls the docker stack image and extracts some build dependencies such as contract ABIs
`,
);

if (args["--setup-only"]) {
  await setupStack();
  process.exit(0);
}

// Kill stack
if (args["--kill"]) {
  await killStack();
  process.exit(0);
}

// Run stack

if (!(await dockerLoggedIn())) {
  const warning = `
In order to run this script and push a new container to the github registry you need to create a personal access token and use it to login to ghcr with docker
  echo $MY_PAT | docker login ghcr.io -u USERNAME --password-stdin

For more information see https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry#authenticating-to-the-container-registry

Create a personal access token and log into docker using the above link then try running this script again.
`;

  console.log(warning);

  process.exit(1);
}

await setupStack();

try {
  await runStack();
} catch (err) {
  console.log("process was interrupted");
}
