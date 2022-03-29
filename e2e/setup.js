// setup.js
const { chromium } = require("playwright");
const { extractExtensionPackage, preparePath } = require("./utils");
const { MM_CONFIG, KEPLR_CONFIG } = require("./config.js");
const path = require("path");
const fs = require("fs");

beforeAll(async () => {
  await extractExtensionPackage(MM_CONFIG.id);
  await extractExtensionPackage(KEPLR_CONFIG.id);
  const pathToKeplrExtension = path.join(__dirname, KEPLR_CONFIG.path);
  const pathToMmExtension = path.join(__dirname, MM_CONFIG.path);
  const userDataDir = path.join(__dirname, "./playwright");
  // need to rm userDataDir or else will store extension state
  if (fs.existsSync(userDataDir)) {
    fs.rmdirSync(userDataDir, { recursive: true });
  }

  // exposing "context" object globally
  context = await chromium.launchPersistentContext(userDataDir, {
    // headless required with extensions. xvfb used for ci/cd
    // devtools: true,
    headless: false,
    locale: "en-US",
    timezoneId: "UTC",
    args: [
      `--disable-extensions-except=${pathToKeplrExtension},${pathToMmExtension}`,
      `--load-extension=${pathToKeplrExtension},${pathToMmExtension}`,
    ],
    recordHar: {
      path: `${await preparePath("./logs")}/har.json`,
    },
  });
  // exposing "page" object globally
  [page] = await context.pages();
  global.context = context; // this is needed to generate screenshots inside custom environment. 'context' is not visible there
});

afterAll(async () => {
  await context.close();
});
