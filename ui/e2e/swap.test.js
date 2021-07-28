require("@babel/polyfill");

// extension
const { keplrNotificationPopup } = require("./pages/KeplrNotificationPopup.js");

// services
const { useStack } = require("../test/stack");

// helpers
const { resetExtensionsConnection, setupExtensions } = require("./helpers.js");

// dex pages
const { swapPage } = require("./pages/SwapPage.js");
const { confirmSwapModal } = require("./pages/ConfirmSwapModal.js");

useStack("every-test");

beforeAll(async () => {
  await setupExtensions();
});

beforeEach(async () => {
  await resetExtensionsConnection();
});

describe("Swap", () => {
  it("swaps", async () => {
    const tokenA = "cusdc";
    const tokenB = "rowan";

    await swapPage.navigate();

    await swapPage.selectTokenA(tokenA);
    await page.waitForTimeout(1000); // slowing down to avoid tokens not updating
    await swapPage.selectTokenB(tokenB);

    await swapPage.fillTokenAValue("100");
    await swapPage.verifyTokenBValue("99.99800003");

    // Check expected output (XXX: hmmm - might have to pull in formulae from core??)

    await swapPage.fillTokenBValue("100");
    await swapPage.verifyTokenAValue("100.00200005");

    await swapPage.clickTokenAMax();
    await swapPage.verifyTokenAValue("10000.0"); // TODO: trim mantissa
    await swapPage.verifyTokenBValue("9980.0299600499");
    await swapPage.verifyDetails({
      expPriceMessage: "0.998003 ROWAN per cUSDC",
      expMinimumReceived: "9880.229660 ROWAN",
      expPriceImpact: "0.10%",
      expLiquidityProviderFee: "9.9800 ROWAN",
    });

    // Input Amount A
    await swapPage.fillTokenAValue("50");
    await swapPage.verifyDetails({
      expPriceMessage: "0.999990 ROWAN per cUSDC",
      expMinimumReceived: "49.499505 ROWAN",
      expPriceImpact: "< 0.01%",
      expLiquidityProviderFee: "0.00025 ROWAN",
    });
    await swapPage.verifyTokenBValue("49.9995000037");

    await swapPage.clickSwap();

    // Confirm dialog shows the expected values
    await confirmSwapModal.verifyDetails({
      tokenA: tokenA,
      tokenB: tokenB,
      expTokenAAmount: "50.000000",
      expTokenBAmount: "49.999500",
      expPriceMessage: "0.999990 ROWAN per cUSDC",
      expMinimumReceived: "49.499505 ROWAN",
      expPriceImpact: "< 0.01%",
      expLiquidityProviderFee: "0.00025 ROWAN",
    });

    await confirmSwapModal.clickConfirmSwap();

    // Confirm transaction popup
    await page.waitForTimeout(1000);
    await keplrNotificationPopup.navigate();
    await keplrNotificationPopup.clickApprove();
    await page.waitForTimeout(10000); // wait for blockchain to update...

    // Wait for balances to be the amounts expected
    await confirmSwapModal.verifySwapMessage(
      "Swapped 50 cUSDC for 49.9995000037 ROWAN",
    );

    await confirmSwapModal.clickClose();

    await swapPage.verifyTokenBalance(tokenA, "Balance: 9,950.00 cUSDC");
    await swapPage.verifyTokenBalance(tokenB, "Balance: 10,050.00 ROWAN");
  });

  it("fails to swap when it can't pay gas with rowan", async () => {
    const tokenA = "rowan";
    const tokenB = "cusdc";
    // Navigate to swap page
    await swapPage.navigate();

    // Get values of token A and token B in account
    await swapPage.selectTokenA(tokenA);
    await page.waitForTimeout(1000); // slowing down to avoid tokens not updating
    await swapPage.selectTokenB(tokenB);

    await swapPage.fillTokenAValue("10000");
    await swapPage.clickSwap();
    await confirmSwapModal.clickConfirmSwap();

    // Confirm transaction popup
    await page.waitForTimeout(1000);
    await keplrNotificationPopup.navigate();
    await keplrNotificationPopup.clickApprove();

    await page.waitForTimeout(10000); // wait for blockchain to update...

    await expect(page).toHaveText("Transaction Failed");
    await expect(page).toHaveText("Not enough ROWAN to cover the gas fees.");

    await confirmSwapModal.closeModal();
  });

  it("swaps tokens with different precisions", async () => {
    let tokenA = "ctest";
    let tokenB = "rowan";

    await swapPage.navigate();

    await swapPage.selectTokenA(tokenA);
    await page.waitForTimeout(1000); // slowing down to avoid tokens not updating
    await swapPage.selectTokenB(tokenB);

    await basicSwapFlow({
      tokenA: tokenA,
      tokenB: tokenB,
      tokenASwapValue: "100",
      assertions: {
        tokenBSwapValue: "99.99800003",
        details: {
          tokenAAmount: "100.000000",
          tokenBAmount: "99.998000",
          priceMessage: "0.999980 ROWAN per cTEST",
          minimumReceived: "98.998020 ROWAN",
          priceImpact: "< 0.01%",
          liquidityProviderFee: "0.0010 ROWAN",
        },
        swapMessage: "Swapped 100 cTEST for 99.99800003 ROWAN",
        finalTokenABalance: "Balance: 99,999,999,999,900.00 cTEST",
        finalTokenBBalance: "Balance: 10,100.00 ROWAN",
      },
    });

    // now switch the selection of tokens
    tokenA = "rowan";
    tokenB = "ctest";
    await swapPage.switchTokens();

    await basicSwapFlow({
      tokenA: tokenA,
      tokenB: tokenB,
      tokenASwapValue: "1000",
      assertions: {
        tokenBSwapValue: "999.820024",
        details: {
          tokenAAmount: "1000.000000",
          tokenBAmount: "999.820024",
          priceMessage: "0.999820 cTEST per ROWAN",
          minimumReceived: "989.821824 cTEST",
          priceImpact: "< 0.01%",
          liquidityProviderFee: "0.1000 cTEST",
        },
        swapMessage: "Swapped 1000 ROWAN for 999.820024 cTEST",
        finalTokenABalance: "Balance: 9,100.00 ROWAN",
        finalTokenBBalance: "Balance: 100,000,000,000,899.82 cTEST",
      },
    });
  });

  async function basicSwapFlow({
    tokenA,
    tokenB,
    tokenASwapValue,
    assertions: {
      tokenBSwapValue,
      details: {
        tokenAAmount,
        tokenBAmount,
        priceMessage,
        minimumReceived,
        priceImpact,
        liquidityProviderFee,
      },
      swapMessage,
      finalTokenABalance,
      finalTokenBBalance,
    },
  }) {
    await swapPage.fillTokenAValue(tokenASwapValue);

    await swapPage.verifyTokenBValue(tokenBSwapValue);

    await swapPage.verifyDetails({
      expPriceMessage: priceMessage,
      expMinimumReceived: minimumReceived,
      expPriceImpact: priceImpact,
      expLiquidityProviderFee: liquidityProviderFee,
    });

    await swapPage.clickSwap();

    // Confirm dialog shows the expected values
    await confirmSwapModal.verifyDetails({
      tokenA: tokenA,
      tokenB: tokenB,
      expTokenAAmount: tokenAAmount,
      expTokenBAmount: tokenBAmount,
      expPriceMessage: priceMessage,
      expMinimumReceived: minimumReceived,
      expPriceImpact: priceImpact,
      expLiquidityProviderFee: liquidityProviderFee,
    });

    await confirmSwapModal.clickConfirmSwap();

    // Confirm transaction popup
    await page.waitForTimeout(1000);
    await keplrNotificationPopup.navigate();
    await keplrNotificationPopup.clickApprove();
    await page.waitForTimeout(10000); // wait for blockchain to update...

    // Wait for balances to be the amounts expected
    await confirmSwapModal.verifySwapMessage(swapMessage);

    await confirmSwapModal.clickClose();

    await swapPage.verifyTokenBalance(tokenA, finalTokenABalance);
    await swapPage.verifyTokenBalance(tokenB, finalTokenBBalance);
  }
});
