import { DEX_TARGET } from "../config";
import * as mock from "../data/mocks/rewards";

export class RewardsPage {
  constructor() {
    this.el = {
      claimableAmount: (type) => `[data-handle="${type}-claimable-amount"]`,
      pendingAmount: (type) => `[data-handle="${type}-pending-rewards"]`,
      reservedCommissionReward: "[data-handl='vs-reserved-commission-rewards']",
      dispensedRewards: (type) => `[data-handle="${type}-dispensed-rewards"]`,
      projectedFullAmount: (type) =>
        `[data-handle="${type}-projected-full-amount"]`,
      claimButton: (type) => `[data-handle="${type}-claim-button"]`,
      modalToken: "[data-handle='token']",
      modalDate: "[data-handle='date']",
      claimConfirmationButton: "[data-handle='confirm-button']",
      closeXButton: '[data-handle="modal-view-close"]',
      cryptoEconRoute:
        "http://localhost:3000/api/lm?address=sif1m625hcmnkc84cgmef6upzzyfu6mxd4jkpnfwwl&key=userData&timestamp=now&snapshot-source=testnet",
      getClaimsRoute:
        "http://127.0.0.1:1317/dispensation/getClaims?type=LiquidityMining",
    };
  }

  async navigate() {
    await page.goto(`${DEX_TARGET}/#/rewards`, {
      waitUntil: "domcontentloaded",
    });
  }

  async verifyLMAmounts({
    claimableAmountNumber,
    pendingAmountNumber,
    dispensedAmountNumber,
    projectedFullAmountNumber,
  }) {
    await expect(await page.innerText(this.el.claimableAmount("lm"))).toBe(
      claimableAmountNumber,
    );
    await expect(await page.innerText(this.el.pendingAmount("lm"))).toBe(
      pendingAmountNumber,
    );
    await expect(await page.innerText(this.el.dispensedRewards("lm"))).toBe(
      dispensedAmountNumber,
    );
    await expect(await page.innerText(this.el.projectedFullAmount("lm"))).toBe(
      projectedFullAmountNumber,
    );

    await expect(await page.isDisabled(this.el.claimButton("lm"))).toBe(false);
    await expect(await page.innerText(this.el.claimButton("lm"))).toBe("Claim");
  }

  async setCryptoeconRoute() {
    await page.route(this.el.cryptoEconRoute, (route) => {
      route.fulfill({
        contentType: "application/json",
        headers: { "access-control-allow-origin": "*" },
        status: 200,
        body: JSON.stringify(mock.lmClaim),
      });
    });
  }

  async clickClaim(type) {
    await page.click(this.el.claimButton(type));
  }

  async setGetClaimsRoute() {
    await page.route(this.el.getClaimsRoute, (route) => {
      route.fulfill({
        contentType: "application/json",
        headers: { "access-control-allow-origin": "*" },
        status: 200,
        body: JSON.stringify(mock.getClaims),
      });
    });
  }
  async verifyTx({ type, claimableAmountNumber, maturityDate }) {
    await expect(await page.innerText(this.el.modalToken)).toBe(
      claimableAmountNumber,
    );
    await expect(await page.innerText(this.el.modalDate)).toBe(maturityDate);
  }

  async clickClaimOnConfirmation() {
    await page.click(this.el.claimConfirmationButton);
  }

  async closeModal() {
    await page.click(this.el.closeXButton);
  }

  async verifyPendingClaim(type) {
    await expect(await page.isDisabled(this.el.claimButton(type))).toBe(true);
    await expect(await page.innerText(this.el.claimButton(type))).toBe(
      "Pending Claim",
    );
  }

  async pause() {
    return await page.pause();
  }
}

export const rewardsPage = new RewardsPage();
