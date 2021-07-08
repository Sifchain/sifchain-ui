require("@babel/polyfill");

// extension
const { keplrNotificationPopup } = require("./pages/KeplrNotificationPopup.js");

// services
const { useStack } = require("../test/stack");

// utils
const { resetExtensionsConnection, setupExtensions } = require("./helpers.js");

// dex pages
const { poolPage } = require("./pages/PoolPage.js");
const { confirmSupplyModal } = require("./pages/ConfirmSupplyModal.js");
const { prepareRowText, sleep } = require("./utils.js");
const { addLiquidity } = require("./api/addLiquidity.js");

useStack("every-test");

beforeAll(async () => {
  await setupExtensions();
});

beforeEach(async () => {
  await resetExtensionsConnection();
});

describe("Add liquidity pools", () => {
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

describe.only("Manage liquidity pools", () => {
  beforeEach(async () => {
    await addLiquidity({
      externalAsset: "ceth",
      externalAmount: "5000000000000000000",
      nativeAmount: "6024096390000000000000",
    });

    // Confirm transaction popup
    await page.waitForTimeout(2000);
    await keplrNotificationPopup.navigate();
    await keplrNotificationPopup.clickApprove();
    await page.waitForTimeout(5000); // wait for blockchain to update...
  });

  it("removes liquidity", async () => {
    console.log("remove liquidity");
    await page.waitForTimeout(30000);
  });
});
