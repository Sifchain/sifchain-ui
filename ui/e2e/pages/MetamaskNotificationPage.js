import { getExtensionPage } from "../utils";
import expect from "expect-playwright";
import { globals } from "../jest.config";

export class MetamaskNotificationPopup {
  constructor() {
    this.url = "/popup.html";
  }

  async navigate() {
    const targetUrl = `chrome-extension://${globals.__MM_EXT_ID__}${this.url}`;

    this.page = await getExtensionPage(globals.__MM_EXT_ID__, this.url);
    if (!this.page) {
      this.page = await getExtensionPage(globals.__MM_EXT_ID__);
      if (!this.page) {
        this.page = await context.newPage();
      }
    }
    if ((await this.page.url()) !== targetUrl) await this.page.goto(targetUrl);
    else await this.page.reload();
  }

  async clickViewFullTransactionDetails() {
    await this.page.click(
      ".confirm-approve-content__view-full-tx-button-wrapper :text('View full transaction details')",
    );
  }

  async clickConfirm() {
    await this.page.click('button:has-text("Confirm")');
  }

  async verifyTransactionDetails(expectedText) {
    await expect(this.page).toHaveText(
      ".confirm-approve-content__permission .confirm-approve-content__medium-text",
      expectedText,
    );
  }
}

export const metamaskNotificationPopup = new MetamaskNotificationPopup();
