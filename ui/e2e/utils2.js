const mkdirp = require("mkdirp");

async function takeScreenshots(name, context) {
  if (context) {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getUTCMonth() + 1;
    const dateOfMonth = date.getUTCDate();
    const hour = date.getUTCHours();
    const minute = date.getUTCMinutes();
    const sec = date.getUTCSeconds();
    const dateString = `${year}-${month}-${dateOfMonth}-${hour}-${minute}-${sec}`;

    const screenshotPath = `screenshots/${name.replace(
      / /g,
      "_",
    )}-${dateString}`;

    await mkdirp("screenshots");

    const pages = await context.pages();
    await pages.forEach(async (page, index) => {
      const title = await page.title();
      await page.screenshot({
        path: `${screenshotPath}_${title}_${index}.png`,
      });
    });
  }
}

async function closeAllPages(context) {
  if (context) {
    const pages = await context.pages();
    await pages.forEach(async (page) => {
      await page.close();
    });
  }
}

module.exports = {
  takeScreenshots,
  closeAllPages,
};
