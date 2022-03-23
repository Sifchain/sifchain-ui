import { KEPLR_CONFIG } from "../config";
import { getExtensionPage } from "../utils";

export class KeplrPage {
  constructor(config = KEPLR_CONFIG) {
    this.config = config;
  }

  async setup() {
    this.page = await getExtensionPage(this.config.id);
    await this.importAccount();
  }

  async navigate(newPage = true) {
    if (newPage) {
      this.page = await context.newPage();
    } else {
      this.page = await getExtensionPage(this.config.id);
    }
    await this.page.goto(`chrome-extension://${this.config.id}/popup.html`);
  }

  async importAccount() {
    await this.page.goto(
      `chrome-extension://${this.config.id}/popup.html#/register`,
    );
    await this.page.click("text=Import existing account");
    await this.page.fill(
      'textarea[name="words"]',
      this.config.options.mnemonic,
    );
    await this.page.fill('input[name="name"]', this.config.options.name);
    await this.page.fill('input[name="password"]', "juniper21");
    await this.page.fill('input[name="confirmPassword"]', "juniper21");
    await this.page.click("text=Next");
    await this.page.click("text=Done");
    // await this.page.close();
  }

  async setKeplrRouteOverrides() {
    // This broke my test locally, so mocked it out
    // May be worth expanding upon this to rm all internet fetches
    await page.route(
      "https://api.coingecko.com/api/v3/simple/price?ids=cosmos&vs_currencies=usd",
      (route) => {
        route.fulfill({
          contentType: "application/json",
          headers: { "access-control-allow-origin": "*" },
          status: 200,
          body: JSON.stringify({ cosmos: { usd: 12.75 } }),
        });
      },
    );
  }
}

export const keplrPage = new KeplrPage();
