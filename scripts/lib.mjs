import { resolve } from "path";
import argDep from "arg";
import chalk from "chalk";
import untildify from "untildify";
import treekill from "tree-kill";

export async function lint() {
  return $`yarn prettier --config .prettierrc -c '**/src/**/*.{vue,ts,tsx,json}'`;
}

export async function lintQuick() {
  return $`yarn pretty-quick --staged --pattern '**/*.{vue,ts,tsx,js,json}'`;
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

export async function createStack(imageName) {
  const trimmedImageName = imageName.trim();
  await $`docker pull ${trimmedImageName}`;
  await $`docker create -it \\
  -p 1317:1317 \\
  -p 7545:7545 \\
  -p 26656:26656 \\
  -p 26657:26657 \\
  --name sif-ui-stack \\
  --platform linux/amd64 \\
  ${trimmedImageName}`;
}

export async function runStack() {
  return await $`docker start -ai sif-ui-stack`;
}

async function gitLogOneline(branch) {
  const res = await fetch(
    `https://api.github.com/repos/Sifchain/sifnode/commits?sha=${branch}`,
  );

  return await res.json();
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

function timeSinceLessThanMinutes(zuluDate, minutes, now = Date.now()) {
  const millisecondsBetweenDates = now - new Date(zuluDate).getTime();
  const milliseconds = minutes * 60 * 1000;
  return millisecondsBetweenDates < milliseconds;
}

function validDate(zuluDate) {
  return typeof zuluDate !== "string" || !zuluDate ? false : true;
}

// If the top commit is too young we need to roll back to the previous one
async function getBestCommitFromBranch(tagName) {
  let commitSha;

  const gitLog = await gitLogOneline(tagName);

  for (const entry of gitLog.slice(0, 4)) {
    // lets try 4 max
    // Lets get the date
    const zuluDate = entry?.commit?.author?.date;

    // validate
    if (!validDate(zuluDate)) {
      throw new Error(
        "Date from github not valid '" +
          entry.commit.author.date +
          "' in the following object: \n" +
          JSON.stringify(entry),
      );
    }

    if (timeSinceLessThanMinutes(zuluDate, 12)) {
      console.log(
        "\nSO THE FIRST COMMIT HERE WAS TOO YOUNG AND HAS PROBABLY NOT BEEN PUSHED TO THE REGISTRY\n   ...fetching another\n\n",
      );

      // This commit wont be deployed yet lets just get the next one instead of failing
      continue;
    }

    commitSha = entry.sha;
    break;
  }

  if (!commitSha) {
    throw new Error(
      "There were NO commits young enough in the commit list! This is pretty weird honestly.",
    );
  }

  return commitSha;
}

export async function setupStack(tagName) {
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
  // const localBuildFolder = resolve(
  //   __dirname,
  //   "../../smart-contracts/build/contracts/",
  // );
  // const bridgeBankJson = resolve(
  //   "/sif/smart-contracts/build/contracts/BridgeBank.json",
  // );
  // await $`mkdir -p ${localBuildFolder}`;
  // await $`docker cp sif-ui-stack:${bridgeBankJson} ${localBuildFolder}`;
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
