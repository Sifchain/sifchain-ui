// import { closeAllPages, takeScreenshots } from "./utils";
const utils = require("./utils2");
// const takeScreenshots = require("./utils").takeScreenshots;
// const closeAllPages = require("./utils").closeAllPages;
const PlaywrightEnvironment = require("jest-playwright-preset/lib/PlaywrightEnvironment")
  .default;

class CustomEnvironment extends PlaywrightEnvironment {
  async setup() {
    await super.setup();
  }

  async teardown() {
    await super.teardown();
  }

  async handleTestEvent(event) {
    // await super.handleTestEvent(event);
    switch (event.name) {
      case "hook_failure":
        await utils.takeScreenshots("hook_failed", this.global.context);
        break;
      case "test_fn_failure":
        const parentName = event.test.parent.name.replace(/\W/g, "-");
        const specName = event.test.name.replace(/\W/g, "-");

        await utils.takeScreenshots(
          `${parentName}-${specName}`,
          this.global.context,
        );
        break;
      case "test_done":
        await utils.closeAllPages(this.global.context);
        break;
      default:
        break;
    }
  }
}

module.exports = CustomEnvironment;
// export default CustomEnvironment;
