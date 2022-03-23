#!/usr/bin/env zx

import { resolve } from "path";

import { dockerLoggedIn, setupStack, runStack, killStack } from "./lib.mjs";

import { arg } from "./lib.mjs";

const args = arg(
  {
    "--kill": Boolean,
    "-k": "--kill",
    "--setup-only": Boolean,
    "--set-default-tag": String,
    "--tag": String,
    "-t": "--tag",
  },
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

--tag -t            Provide an image tag to use. Usually a stable tag ie. \`develop\` or a commit hash ie. \`649e35193c8ef0730458f058d52693b1a1ca5d77\`
--kill --k          Kill any stack processes and remove all existing docker ui-stack containers 
--setup-only        This only pulls the docker stack image and extracts some build dependencies such as contract ABIs
--set-default-tag   Set the default docker image tag used by the stack command. This alters the latest file on disk which needs to be checked in.

`,
);

const tagName = args["--tag"] || undefined;

if (args["--set-default-tag"]) {
  const tag = args["--set-default-tag"];
  await fs.writeFile(
    resolve(__dirname, "./latest"),
    `ghcr.io/sifchain/sifnode/ui-stack:${tag}`,
  );
  process.exit(0);
}

if (args["--setup-only"]) {
  await setupStack(tagName);
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

await setupStack(tagName);

try {
  await runStack();
} catch (err) {
  console.log("process was interrupted");
}
