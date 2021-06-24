import { DEX_TARGET } from "../config";
import expect from "expect-playwright";
import { assertWaitedText } from "../utils";

export class BalancesPage {
  constructor() {
    this.el = {
      assetAmount: (asset) => `[data-handle='${asset}-row-amount']`,
    };
  }

  async navigate() {
    await page.goto(`${DEX_TARGET}/#/balances`, {
      waitUntil: "domcontentloaded",
    });
  }

  async openTab(tabName) {
    await page.click(`[data-handle='${tabName.toLowerCase()}-tab']`);
  }

  // TODO: handling popup to be done outside of this page method
  async export(asset, amount) {
    await page.click(`[data-handle='export-${asset.toLowerCase()}']`);
    await page.click('[data-handle="import-input"]');
    await page.fill('[data-handle="import-input"]', amount);
    await page.click('button:has-text("Export")');

    const [confirmPopup] = await Promise.all([
      context.waitForEvent("page"),
      page.click('button:has-text("Confirm Export")'),
    ]);

    await Promise.all([
      confirmPopup.waitForEvent("close"),
      confirmPopup.click('button:has-text("Approve")'),
    ]);

    await page.waitForSelector("text=Transaction Submitted");
    await this.closeSubmissionWindow();
    await page.waitForTimeout(10000); // wait for sifnode to validate the tx TODO: replace this wait with some dynamic condition
  }

  async import(asset, amount) {
    await page.click(`[data-handle='import-${asset.toLowerCase()}']`);
    await page.click('[data-handle="import-input"]');
    await page.fill('[data-handle="import-input"]', amount);
    await await page.click('button:has-text("Import")');
  }

  async clickConfirmImport() {
    await page.click('button:has-text("Confirm Import")'); // this opens new notification page
  }

  async verifyAssetAmount(asset, expectedAmount) {
    await assertWaitedText(this.el.assetAmount(asset), expectedAmount);
  }

  async closeSubmissionWindow() {
    await page.waitForTimeout(1000);
    await page.click("text=×"); // sometimes clicking 'x' doesn't close the window (even if Playwright says it clicked). Waiting a bit helps
  }

  async verifyTransactionPending(asset) {
    await expect(page).toHaveSelector(
      `${this.el.assetAmount(asset)} [data-handle='pending-tx-marker']`,
    );
  }
}

export const balancesPage = new BalancesPage();
