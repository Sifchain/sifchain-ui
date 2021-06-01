import { resolve } from "path";
import argDep from "arg";
import untildify from "untildify";
import treekill from "tree-kill";

export async function lint() {
  return $`yarn prettier --config .prettierrc -c '**/*.{vue,ts,json}'`;
}

export async function lintQuick() {
  return $`yarn pretty-quick --staged --pattern 'ui/**/*.{vue,ts,js,json}'`;
}

export async function e2eTest(opt) {
  if (opt?.port) process.env.PORT = opt.port;
  const e2e = resolve(__dirname, "../e2e");
  return await $`cd ${e2e} && ./scripts/test.sh`;
}

export async function e2eTestDebug() {
  return $`cd e2e && DEBUG=pw:api NOSTACK=1 ./scripts/test.sh`;
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
    const q = $.quote;
    $.quote = (a) => a;
    const out = JSON.parse(await fs.readFile(resolve(path)));
    $.quote = q;
    return out;
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

export async function setupStack(imageName) {
  const IMAGE_NAME = imageName || `${await $`cat ./scripts/latest`}`;

  await killStack();

  await createStack(IMAGE_NAME);

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
      console.log("Killing server (" + pid + ")...");
      await treekill(pid);
      console.log("Killed");
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
