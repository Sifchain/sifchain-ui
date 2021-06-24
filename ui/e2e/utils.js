// utils.js
import StreamZip from "node-stream-zip";
import axios from "axios";
import fs from "fs";
import path from "path";
import mkdirp from "mkdirp";

const retry = require("retry-assert");

// Not in use, don't have good place to get the extension zips, for now
export async function downloadFile(name, url, dir) {
  const write = path.resolve(dir, `${name}.zip`);
  const writer = fs.createWriteStream(write);

  const response = await axios({
    url,
    method: "GET",
    responseType: "stream",
  });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}

export async function extractFile(downloadedFile, extractDestination) {
  const zip = new StreamZip.async({ file: downloadedFile });
  if (!fs.existsSync(extractDestination)) {
    fs.mkdirSync(extractDestination);
  }
  await zip.extract(null, extractDestination);
}

export async function extractExtensionPackage(extensionId) {
  await extractFile(`downloads/${extensionId}.zip`, "./extensions");
  return;
}

// not used right now. It's not necessary to use it when id is static
export async function getMetamaskExtensionId() {
  const pages = await context.pages();

  const asyncFilter = async (arr, predicate) => {
    const results = await Promise.all(arr.map(predicate));

    return arr.filter((_v, index) => results[index]);
  };

  const mmPages = await asyncFilter(pages, async (page) => {
    return (await page.title()) === "MetaMask";
  });

  if (mmPages.length === 0) return undefined;
  else {
    const mmPage = mmPages[0];
    const regex = /:\/\/(.*?)\//;
    const match = regex.exec(mmPage.url());
    if (match.length <= 1) return undefined;
    else {
      return match[1];
    }
  }
}

export async function getExtensionPage(extensionId, suffixUrl = undefined) {
  let matchingUrl;
  if (!suffixUrl) {
    matchingUrl = `chrome-extension://${extensionId}`;
  } else {
    matchingUrl = `chrome-extension://${extensionId}${suffixUrl}`;
  }
  const pages = await context.pages();
  const foundPages = pages.filter((page) => page.url().includes(matchingUrl));

  if (foundPages.length > 0) return foundPages[0];
  else return undefined;
}

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getInputValue(selector) {
  return await page.$eval(selector, (el) => el.value);
}

export async function assertWaitedText(
  selector,
  expectedText,
  timeout = 30000,
) {
  const text = await retry()
    .fn(() => page.innerText(selector))
    .withTimeout(timeout)
    .until((text) => expect(text.trim()).toBe(expectedText));
}

export async function assertWaitedValue(
  selector,
  expectedValue,
  timeout = 30000,
) {
  const value = await retry()
    .fn(() => getInputValue(selector))
    .withTimeout(timeout)
    .until((value) => expect(value).toBe(expectedValue));
}

export async function preparePath(path) {
  if (!fs.existsSync(path)) {
    await mkdirp(path);
  }
  return path;
}
