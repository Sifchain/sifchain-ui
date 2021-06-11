import { resolve } from "path";
import argDep from "arg";
import chalk from "chalk";
import untildify from "untildify";
import treekill from "tree-kill";

export async function lint() {
  return $`yarn prettier --config .prettierrc -c '**/*.{vue,ts,json}'`;
}

export async function lintQuick() {
  return $`yarn pretty-quick --staged --pattern 'ui/**/*.{vue,ts,js,json}'`;
}

// NOTE: not making this fn async as we need access to the child
// prop on the PromiseChild in order to kill the process
export function serveBuiltApp() {
  const distFolder = resolve(__dirname, "../app/dist");
  return nothrow($`yarn serve ${distFolder}`); // no throw means the promise will not throw an error when it is killed
}

export async function waitOn(...requirements) {
  return $`wait-on ${requirements}`;
}

export async function load(path) {
  try {
    return JSON.parse(await fs.readFile(resolve(path)));
  } catch (err) {
    console.log(err);
    return null;
  }
}

export async function killStack() {
  if (`${await $`docker ps -qaf name=sif-ui-stack`}`) {
    await $`docker stop sif-ui-stack`;
    await $`docker rm sif-ui-stack`;
  }
}

export async function dockerLoggedIn() {
  const config = await load(untildify("~/.docker/config.json"));
  return !(!config || config.auths["ghcr.io"].auto === null);
}

export function createStack(imageName) {
  return $`docker create -it \\
  -p 1317:1317 \\
  -p 7545:7545 \\
  -p 26656:26656 \\
  -p 26657:26657 \\
  --name sif-ui-stack \\
  --platform linux/amd64 \\
  ${imageName.trim()}`;
}

export async function runStack() {
  return await $`docker start -ai sif-ui-stack`;
}

async function getLatestCommitForBranch(branch) {
  const res = await fetch(
    `https://api.github.com/repos/Sifchain/sifnode/branches/${branch}`,
  );
  const {
    commit: { sha: commit },
  } = await res.json();
  return commit;
}

async function dockerImageExistsWithTag(tag) {
  const name = `ghcr.io/sifchain/sifnode/ui-stack:` + tag;
  try {
    await $`docker manifest inspect ${name} > /dev/null`;
    return true;
  } catch (err) {
    return false;
  }
}

export async function setupStack(tagName) {
  if (tagName && ["develop", "master"].includes(tagName)) {
    // Check if the latest commit in GHs develop branch matches what is in the registry

    console.log("Getting latest commit...");
    const commit = await getLatestCommitForBranch(tagName);
    console.log("Checking latest commit exists in registry...");
    const imageExists = await dockerImageExistsWithTag(commit);

    if (!imageExists) {
      console.error(
        `

=========================
|     HOW ERRONEOUS!    |
=========================

It appears that the latest commit hash from '${tagName}' cannot be found in the registry. 
We were looking for the following commit hash: 

  ${commit}

This could happen because either there has been a recent commit in the last few minutes 
and the image has not been pushed up yet or something went horribly wrong while preparing the image.

We suggest you investigate over in the sifnode repo then try running this script again.

  https://github.com/Sifchain/sifnode/tree/${tagName}
        
        `,
      );
      process.exit(1);
    }
  }

  const defaultImageName = `${await fs.readFile(
    resolve(__dirname, "./latest"),
  )}`;

  const imageName = tagName
    ? defaultImageName.replace(/\:(.+)$/, ":" + tagName)
    : defaultImageName;

  console.log(`Using image ${chalk.yellow(imageName)}`);

  await killStack();

  await createStack(imageName);

  await extractABIs();
}

export async function extractABIs() {
  const localBuildFolder = resolve(
    __dirname,
    "../../smart-contracts/build/contracts/",
  );

  const bridgeBankJson = resolve(
    "/sif/smart-contracts/build/contracts/BridgeBank.json",
  );

  await $`mkdir -p ${localBuildFolder}`;

  await $`docker cp sif-ui-stack:${bridgeBankJson} ${localBuildFolder}`;
}

// Note procs need to be ProcessPromises so you need to watch `async` and `await` wrapping these in normal promises
export async function race(...procs) {
  await Promise.race(procs);

  // one of the promises has finished
  const children = procs.map((p) => p.child).filter(Boolean);

  // Kill all dangling child processes
  for (const child of children) {
    try {
      const pid = child.pid;
      await treekill(pid);
    } catch (err) {
      console.log({ err });
    }
  }
}
export function arg(
  argObj,
  usageMsg = `This command has no usage message set`,
) {
  const args = argDep({ "--help": Boolean, ...argObj });
  if (args["--help"]) {
    console.log(usageMsg);
    process.exit(0);
  }

  return args;
}
