// setup.js
const { chromium } = require("playwright");
const { extractExtensionPackage, getMetamaskExtensionId } = require("./utils");
const { MM_CONFIG, KEPLR_CONFIG } = require("./config.js");
const path = require("path");
const fs = require("fs");
const { globals } = require("./jest.config");

beforeAll(async () => {
  await extractExtensionPackage(MM_CONFIG.fileId);
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
  });
  // exposing "page" object globally
  [page] = await context.pages();

  await context.waitForEvent("page");
  // set global MM extension id object
  globals.__MM_EXT_ID__ = await getMetamaskExtensionId();
});
