const { takeScreenshots, closeAllPages } = require("./utils2");
const PlaywrightEnvironment =
  require("jest-playwright-preset/lib/PlaywrightEnvironment").default;

class CustomEnvironment extends PlaywrightEnvironment {
  async setup() {
    await super.setup();
  }

  async teardown() {
    await super.teardown();
  }

  async handleTestEvent(event) {
    switch (event.name) {
      case "hook_failure":
        await takeScreenshots("hook_failed", this.global.context);
        break;
      case "test_fn_failure":
        const parentName = event.test.parent.name.replace(/\W/g, "-");
        const specName = event.test.name.replace(/\W/g, "-");

        await takeScreenshots(`${parentName}-${specName}`, this.global.context);
        break;
      case "test_done":
        await closeAllPages(this.global.context);
        break;
      default:
        break;
    }
  }
}

module.exports = CustomEnvironment;
