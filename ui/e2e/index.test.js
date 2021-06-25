/*
 * TODO
 * ==============
 * Clients for inspecting the blockchain
 * - sifchainBlockchainAccount - class should represent sifchain blockain
 * - ethereumBlockchainAccount - class should represent ethereumBlockchain
 */
require("@babel/polyfill");

// configs
const { KEPLR_CONFIG } = require("./config.js");
const keplrConfig = require("../core/src/config.localnet.json");

// extension
const { keplrNotificationPopup } = require("./pages/KeplrNotificationPopup.js");
const {
  metamaskNotificationPopup,
} = require("./pages/MetamaskNotificationPage.js");

// services
const { getSifchainBalances } = require("./sifchain.js");
const { advanceEthBlocks } = require("./ethereum.js");
const { useStack } = require("../test/stack");

// utils
const { resetExtensionsConnection, setupExtensions } = require("./helpers.js");

// dex pages
const { balancesPage } = require("./pages/BalancesPage.js");
const { poolPage } = require("./pages/PoolPage.js");
const { confirmSupplyModal } = require("./pages/ConfirmSupplyModal.js");
const { rewardsPage } = require("./pages/RewardsPage.js");

useStack("every-test");

beforeAll(async () => {
  await setupExtensions();
});

beforeEach(async () => {
  await resetExtensionsConnection();
});

describe("Import/export", () => {
  it("imports rowan", async () => {
    const assetNative = "rowan";
    const exportAmount = "500";
    const assetExternal = "erowan";
    const importAmount = "100";
    // First we need to export rowan in order to have erowan on the bridgebank contract
    await balancesPage.navigate();

    await balancesPage.openTab("native");
    await balancesPage.export(assetNative, exportAmount);

    await balancesPage.openTab("external");
    await balancesPage.verifyAssetAmount(assetExternal, "600.000000");

    // Now lets import erowan
    await balancesPage.import(assetExternal, importAmount);

    await balancesPage.clickConfirmImport();

    await page.waitForTimeout(500);
    await metamaskNotificationPopup.navigate();

    await page.waitForTimeout(1000);
    await metamaskNotificationPopup.clickViewFullTransactionDetails();
    await metamaskNotificationPopup.verifyTransactionDetails(
      `${importAmount} ${assetExternal}`,
    );

    await metamaskNotificationPopup.clickConfirm();
    await page.waitForTimeout(1000);

    await metamaskNotificationPopup.navigate(); // this call is needed to reload this.page with a new popup page
    await metamaskNotificationPopup.clickConfirm();

    await page.waitForTimeout(1000);
    await balancesPage.closeSubmissionWindow();
    // Check that tx marker for the tx is there
    await balancesPage.verifyTransactionPending(assetNative);

    // move chain forward
    await advanceEthBlocks(52);

    await page.waitForSelector("text=has succeded", { timeout: 60 * 1000 });

    await balancesPage.openTab("native");
    await balancesPage.verifyAssetAmount(assetNative, "9600.000000");
  });

  it("imports ether", async () => {
    const importAmount = "1";
    const assetExternal = "eth";
    const assetNative = "ceth";

    await balancesPage.navigate();

    const cEthBalance = await getSifchainBalances(
      keplrConfig.sifApiUrl,
      KEPLR_CONFIG.options.address,
      assetNative,
    );

    await balancesPage.openTab("external");
    await balancesPage.import(assetExternal, importAmount);

    await balancesPage.clickConfirmImport();
    await page.waitForTimeout(1000);

    await metamaskNotificationPopup.navigate();
    await metamaskNotificationPopup.clickConfirm();

    await page.waitForTimeout(1000);
    await balancesPage.closeSubmissionWindow();

    // Check that tx marker for the tx is there
    await balancesPage.verifyTransactionPending(assetNative);

    // move chain forward
    await advanceEthBlocks(52);

    await page.waitForSelector("text=has succeded", { timeout: 60 * 1000 });

    const expectedAmount = (Number(cEthBalance) + Number(importAmount)).toFixed(
      6,
    );
    await balancesPage.verifyAssetAmount(assetNative, expectedAmount);
  });

  it("imports tokens", async () => {
    const importAmount = "1";
    const importAsset = "usdc";
    await balancesPage.navigate();

    const cBalance = await getSifchainBalances(
      keplrConfig.sifApiUrl,
      KEPLR_CONFIG.options.address,
      "cusdc",
    );

    await balancesPage.openTab("external");
    await balancesPage.import(importAsset, importAmount);

    await balancesPage.clickConfirmImport();
    await page.waitForTimeout(1000);

    await metamaskNotificationPopup.navigate();
    await metamaskNotificationPopup.clickViewFullTransactionDetails();
    await metamaskNotificationPopup.verifyTransactionDetails(
      `${importAmount} ${importAsset}`,
    );
    await metamaskNotificationPopup.clickConfirm();
    await page.waitForTimeout(1000);
    await metamaskNotificationPopup.navigate(); // this call is needed to reload this.page with a new popup page
    await metamaskNotificationPopup.clickConfirm();

    await balancesPage.closeSubmissionWindow();

    await advanceEthBlocks(52);

    await page.waitForSelector("text=has succeded", { timeout: 60 * 1000 });

    const expectedAmount = (Number(cBalance) + Number(importAmount)).toFixed(6);
    await balancesPage.verifyAssetAmount("cusdc", expectedAmount);
  });
});

describe("Liquidity pools", () => {
  it("adds liquidity", async () => {
    const tokenA = "ceth";
    const tokenB = "rowan";
    await poolPage.navigate();

    await poolPage.clickAddLiquidity();

    await poolPage.selectTokenA(tokenA);
    await poolPage.fillTokenAValue("10");
    await poolPage.verifyTokenBValue("12048.19277");

    await poolPage.fillTokenBValue("10000");
    await poolPage.verifyTokenAValue("8.30000");

    await poolPage.clickTokenAMax();
    await poolPage.verifyTokenAValue("100.000000000000000000");
    await poolPage.verifyTokenBValue("120481.92771");

    expect((await poolPage.getActionsButtonText()).toUpperCase()).toBe(
      "INSUFFICIENT FUNDS",
    );

    await poolPage.clickTokenAMax();
    await poolPage.fillTokenAValue("5");
    await poolPage.verifyTokenBValue("6024.09639");

    expect((await poolPage.getActionsButtonText()).toUpperCase()).toBe(
      "ADD LIQUIDITY",
    );

    await poolPage.verifyPoolPrices({
      expForwardNumber: "0.000830",
      expForwardSymbols: "cETH per ROWAN",
      expBackwardNumber: "1204.819277",
      expBackwardSymbols: "ROWAN per cETH",
    });

    await poolPage.verifyPoolEstimates({
      expForwardNumber: "0.000830",
      expForwardSymbols: "CETH per ROWAN", // <-- this is a bug TODO: cETH
      expBackwardNumber: "1204.819277",
      expBackwardSymbols: "ROWAN per CETH", // <-- this is a bug TODO: cETH
      expShareNumber: "0.06%",
    });

    // click Add Liquidity
    await poolPage.clickActionsGo();

    expect(await confirmSupplyModal.getTitle()).toBe("You are depositing");

    expect(
      prepareRowText(await confirmSupplyModal.getTokenInfoRowText(tokenA)),
    ).toBe("cETH Deposited 5.000000");

    expect(
      prepareRowText(await confirmSupplyModal.getTokenInfoRowText(tokenB)),
    ).toBe("ROWAN Deposited 6024.096390");

    expect(
      prepareRowText(await confirmSupplyModal.getRatesBPerARowText()),
    ).toBe("Rates 1 cETH = 1204.81927711 ROWAN");
    expect(
      prepareRowText(await confirmSupplyModal.getRatesAPerBRowText()),
    ).toBe("1 ROWAN = 0.00083000 cETH");
    expect(
      prepareRowText(await confirmSupplyModal.getRatesShareOfPoolText()),
    ).toBe("Share of Pool: 0.06%"); // TODO: remove ":"

    await confirmSupplyModal.clickConfirmSupply();

    expect(await confirmSupplyModal.getConfirmationWaitText()).toBe(
      "Supplying 5.00000 ceth and 6024.09639 rowan",
    );

    // Confirm transaction popup
    await page.waitForTimeout(1000);
    await keplrNotificationPopup.navigate();
    await keplrNotificationPopup.clickApprove();
    await page.waitForTimeout(10000); // wait for blockchain to update...

    await confirmSupplyModal.closeModal();

    await poolPage.clickManagePool(tokenA, tokenB);
    expect(prepareRowText(await poolPage.getTotalPooledText(tokenA))).toBe(
      "Total Pooled cETH: 8305.00000",
    );
    expect(prepareRowText(await poolPage.getTotalPooledText(tokenB))).toBe(
      "Total Pooled ROWAN: 10006024.09639",
    );
    expect(prepareRowText(await poolPage.getTotalPoolShareText())).toBe(
      "Your Pool Share (%): 0.0602",
    );
  });

  it("fails to add liquidity when can't pay gas with rowan", async () => {
    const tokenA = "cusdc";

    await poolPage.navigate();
    await poolPage.clickAddLiquidity();
    await poolPage.selectTokenA(tokenA);
    await poolPage.fillTokenBValue("10000");
    await poolPage.clickActionsGo();
    await confirmSupplyModal.clickConfirmSupply();

    // Confirm transaction popup
    await page.waitForTimeout(1000);
    await keplrNotificationPopup.navigate();
    await keplrNotificationPopup.clickApprove();
    await page.waitForTimeout(10000); // wait for blockchain to update...

    await expect(page).toHaveText("Transaction Failed");
    await expect(page).toHaveText("Not enough ROWAN to cover the gas fees");

    await confirmSupplyModal.closeModal();
  });
});

describe("Precision handling", () => {
  it("formats long amounts in confirmation screen", async () => {
    const tokenA = "ceth";

    await poolPage.navigate();
    await poolPage.clickAddLiquidity();

    // Select ceth
    await poolPage.selectTokenA(tokenA);
    await poolPage.fillTokenAValue("1.00000000000000000000000000000");

    await poolPage.clickActionsGo();

    expect(await confirmSupplyModal.getTokenAmountText(tokenA)).toEqual(
      "1.000000",
    );
  });
});

describe("Liquidity mining", () => {
  it("shows liquidity mining rewards", async () => {
    await rewardsPage.navigate();
    await rewardsPage.setCryptoeconRoute();
    await page.reload();

    await rewardsPage.verifyLMAmounts({
      claimableAmountNumber: "200.0000",
      pendingAmountNumber: "600.0000",
      dispensedAmountNumber: "0",
      projectedFullAmountNumber: "200000.0000",
    });
  });

  it("claims liquidity mining rewards", async () => {
    await rewardsPage.navigate();

    await rewardsPage.setCryptoeconRoute();
    await page.reload();

    await rewardsPage.clickClaim("lm");
    await rewardsPage.verifyTx({
      type: "lm",
      claimableAmountNumber: "200.0000",
      maturityDate: "10/8/2021, 12:48:43 PM",
    });

    await rewardsPage.clickClaimOnConfirmation();
    await rewardsPage.setGetClaimsRoute();
    // popup
    await page.waitForTimeout(1000);
    await keplrNotificationPopup.navigate();
    await keplrNotificationPopup.clickApprove();
    await page.waitForTimeout(10000); // wait for blockchain to update...
    await rewardsPage.closeModal();
    // should be pending claim now
    await rewardsPage.verifyPendingClaim("lm");
  });
});

function prepareRowText(row) {
  return row
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean)
    .join(" ");
}
