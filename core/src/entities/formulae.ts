import { Amount, IAmount } from "./Amount";

export function slipAdjustment(
  r: IAmount, // Native amount added
  a: IAmount, // External amount added
  R: IAmount, // Native Balance (before)
  A: IAmount, // External Balance (before)
): IAmount {
  // slipAdjustment = ((R a - r A)/((r + R) (a + A)))
  const slipAdjDenominator = r.add(R).multiply(a.add(A));
  let slipAdjustmentReciprocal: IAmount;
  if (R.multiply(a).greaterThan(r.multiply(A))) {
    slipAdjustmentReciprocal = R.multiply(a)
      .subtract(r.multiply(A))
      .divide(slipAdjDenominator);
  } else {
    slipAdjustmentReciprocal = r
      .multiply(A)
      .subtract(R.multiply(a))
      .divide(slipAdjDenominator);
  }
  // (1 - ABS((R a - r A)/((2 r + R) (a + A))))
  return Amount("1").subtract(slipAdjustmentReciprocal);
}

/**
 *
 * @param r Native amount added
 * @param a External amount added
 * @param R Native Balance (before)
 * @param A External Balance (before)
 * @param P Existing Pool Units
 * @returns
 */
export function calculatePoolUnits(
  r: IAmount, // Native amount added
  a: IAmount, // External amount added
  R: IAmount, // Native Balance (before)
  A: IAmount, // External Balance (before)
  P: IAmount, // existing Pool Units
) {
  if (A.equalTo("0") || R.equalTo("0") || P.equalTo("0")) {
    return r;
  }

  if (a.equalTo("0") && r.equalTo("0")) {
    return Amount("0");
  }

  const slipAdjustmentCalc = slipAdjustment(r, a, R, A);

  // ((P (a R + A r))
  const numerator = P.multiply(a.multiply(R).add(A.multiply(r)));
  const denominator = Amount("2").multiply(A).multiply(R);

  return numerator.divide(denominator).multiply(slipAdjustmentCalc);
}

function abs(num: IAmount) {
  if (num.lessThan("0")) {
    return num.multiply("-1");
  }
  return num;
}

const TEN_THOUSAND = Amount("10000");

export function calculateWithdrawal({
  poolUnits,
  nativeAssetBalance,
  externalAssetBalance,
  lpUnits,
  wBasisPoints,
  asymmetry,
}: {
  poolUnits: IAmount;
  nativeAssetBalance: IAmount;
  externalAssetBalance: IAmount;
  lpUnits: IAmount;
  wBasisPoints: IAmount;
  asymmetry: IAmount;
}) {
  let unitsToClaim = Amount("0");
  if (!wBasisPoints.equalTo("0")) {
    unitsToClaim = lpUnits.divide(TEN_THOUSAND.divide(wBasisPoints));
  }

  let poolUnitsOverUnitsToClaim = Amount("0");
  if (!unitsToClaim.equalTo("0")) {
    poolUnitsOverUnitsToClaim = poolUnits.divide(unitsToClaim);
  }

  let withdrawExternalAssetAmountPreSwap = Amount("0");
  let withdrawNativeAssetAmountPreSwap = Amount("0");
  if (!poolUnitsOverUnitsToClaim.equalTo("0")) {
    withdrawExternalAssetAmountPreSwap = externalAssetBalance.divide(
      poolUnitsOverUnitsToClaim,
    );

    withdrawNativeAssetAmountPreSwap = nativeAssetBalance.divide(
      poolUnitsOverUnitsToClaim,
    );
  }

  const lpUnitsLeft = lpUnits.subtract(unitsToClaim);

  const swapAmount = abs(
    asymmetry.equalTo("0")
      ? Amount("0")
      : asymmetry.lessThan("0")
      ? externalAssetBalance.divide(
          poolUnits.divide(unitsToClaim.divide(TEN_THOUSAND.divide(asymmetry))),
        )
      : nativeAssetBalance.divide(
          poolUnits.divide(unitsToClaim.divide(TEN_THOUSAND.divide(asymmetry))),
        ),
  );

  const newExternalAssetBalance = externalAssetBalance.subtract(
    withdrawExternalAssetAmountPreSwap,
  );

  const newNativeAssetBalance = nativeAssetBalance.subtract(
    withdrawNativeAssetAmountPreSwap,
  );

  const withdrawNativeAssetAmount = asymmetry.lessThan("0")
    ? withdrawNativeAssetAmountPreSwap.add(
        calculateSwapResult(
          abs(swapAmount),
          newExternalAssetBalance,
          newNativeAssetBalance,
        ),
      )
    : withdrawNativeAssetAmountPreSwap.subtract(swapAmount);

  const withdrawExternalAssetAmount = asymmetry.lessThan("0")
    ? withdrawExternalAssetAmountPreSwap.subtract(swapAmount)
    : withdrawExternalAssetAmountPreSwap.add(
        calculateSwapResult(
          abs(swapAmount),
          newNativeAssetBalance,
          newExternalAssetBalance,
        ),
      );

  return {
    withdrawNativeAssetAmount,
    withdrawExternalAssetAmount,
    lpUnitsLeft,
    swapAmount,
  };
}

/**
 * Calculate Swap Result based on formula ( x * X * Y ) / ( x + X ) ^ 2
 * @param X  External Balance
 * @param x Swap Amount
 * @param Y Native Balance
 * @returns swapAmount
 */
export function calculateSwapResult(x: IAmount, X: IAmount, Y: IAmount) {
  if (x.equalTo("0") || X.equalTo("0") || Y.equalTo("0")) {
    return Amount("0");
  }
  const xPlusX = x.add(X);
  return x.multiply(X).multiply(Y).divide(xPlusX.multiply(xPlusX));
}

/**
 * Calculate Swap Result based on formula (( x * X * Y ) / ( x + X ) ^ 2) * (1 + adjustment / 100)
 * @param x Swap Amount
 * @param X  External Balance
 * @param Y Native Balance
 * @param adjustment PMTP purchasing power adjustment
 * @returns swapAmount
 */
export function calculateSwapResult_pmtp(
  x: IAmount,
  X: IAmount,
  Y: IAmount,
  adjustment: IAmount,
) {
  if (x.equalTo("0") || X.equalTo("0") || Y.equalTo("0")) {
    return Amount("0");
  }

  const adjustmentPercentage = adjustment.divide(
    Amount("100".concat("0".repeat(18))),
  );

  return calculateSwapResult(x, X, Y).multiply(
    Amount("1").add(adjustmentPercentage),
  );
}

// Formula: S = (x * X * Y) / (x + X) ^ 2
// Reverse Formula: x = ( -2*X*S + X*Y - X*sqrt( Y*(Y - 4*S) ) ) / 2*S
// Need to use Big.js for sqrt calculation
// Ok to accept a little precision loss as reverse swap amount can be rough
export function calculateReverseSwapResult(S: IAmount, X: IAmount, Y: IAmount) {
  // Adding a check here because sqrt of a negative number will throw an exception
  if (
    S.equalTo("0") ||
    X.equalTo("0") ||
    S.multiply(Amount("4")).greaterThan(Y)
  ) {
    return Amount("0");
  }
  const term1 = Amount("-2").multiply(X).multiply(S);
  const term2 = X.multiply(Y);
  const underRoot = Y.multiply(Y.subtract(S.multiply(Amount("4"))));
  const term3 = X.multiply(underRoot.sqrt());
  const numerator = term1.add(term2).subtract(term3);
  const denominator = S.multiply(Amount("2"));
  const x = numerator.divide(denominator);
  return x.greaterThanOrEqual(Amount("0")) ? x : Amount("0");
}

/**
 * Calculate Provider Fee according to the formula: ( x^2 * Y ) / ( x + X )^2
 * @param x Swap Amount
 * @param X External Balance
 * @param Y Native Balance
 * @returns providerFee
 */
export function calculateProviderFee(x: IAmount, X: IAmount, Y: IAmount) {
  if (x.equalTo("0") || X.equalTo("0") || Y.equalTo("0")) {
    return Amount("0");
  }
  const xPlusX = x.add(X);
  return x.multiply(x).multiply(Y).divide(xPlusX.multiply(xPlusX));
}

/**
 * Calculate price impact according to the formula (x) / (x + X)
 * @param x Swap Amount
 * @param X External Balance
 * @returns
 */
export function calculatePriceImpact(x: IAmount, X: IAmount) {
  if (x.equalTo("0")) {
    return Amount("0");
  }
  const denominator = x.add(X);
  return x.divide(denominator);
}

// new swap & liquidity provider fee calculation functions:

/**
 *  Implements the spec for `Fixed Rate Swap Fees`
 *
 * - proposal - https://github.com/Sifchain/sifnode/blob/master/docs/proposals/fixed_rate_swap_fees.md
 * - tutorial - https://github.com/Sifchain/sifnode/blob/master/docs/tutorials/swap-fee-rate.md
 *
 */

const ONE = Amount(1);

export type SwapParams = {
  /**
   * amount to be swapped from
   */
  inputAmount: IAmount;
  /**
   * amount of input asset in the pool
   */
  inputBalanceInPool: IAmount;
  /**
   * amount of output asset in the pool
   */
  outputBalanceInPool: IAmount;
  /**
   * current swap fee rate (sifnode gov param)
   */
  swapFeeRate: IAmount;
  /**
   * current PMTP ratio shifting rate
   */
  currentRatioShiftingRate: IAmount;
};

/**
 * Calculate Swap Amount from ROWAN to EXTERNAL ASSET based on formula:
 * - (1 - f) * (1 + r) * x * Y / (x + X)
 *
 * where:
 * - f is the swap fee rate
 * - x is the input amount
 * - X is the balance of input token in the pool
 * - Y is the balance of output token in the pool
 * - r is the interest rate
 *
 * @param params {SwapParams} - swap parameters
 *
 * @returns amount obtained from swap
 *
 * @example
 *
 * const inputAmount = BigNumber(200000000000000);
 * const inputBalanceInPool = BigNumber(1999800619938006200);
 * const outputBalanceInPool = BigNumber(2000200000000000000);
 * const swapFeeRate = BigNumber(0.003);
 * const currentRatioShiftingRate = BigNumber(0);
 *
 * calculateSwapFromRowan({
 *  inputAmount,
 *  inputBalanceInPool,
 *  outputBalanceInPool,
 *  swapFeeRate,
 *  currentRatioShiftingRate
 * });
 */
export function calculateSwapFromRowan({
  inputAmount: x,
  inputBalanceInPool: X,
  outputBalanceInPool: Y,
  swapFeeRate: f,
  currentRatioShiftingRate: r,
}: SwapParams) {
  // consider the formula:
  // (1 - f) * (1 + r) * x * Y / (x + X)
  const term1 = ONE.subtract(f); // (1 - f)
  const term2 = ONE.add(r); // (1 + r)
  const term3 = x.multiply(Y); // x * Y
  const term4 = x.add(X); // (x + X)

  return term1.multiply(term2).multiply(term3).divide(term4);
}

/**
 * Calculate Swap Fee from ROWAN to EXTERNAL ASSET based on formula:
 * - f * (1 + r) * x * Y / (x + X)
 *
 * where:
 * - f is the swap fee rate
 * - x is the input amount
 * - X is the balance of input token in the pool
 * - Y is the balance of output token in the pool
 * - r is the current ratio shifting running rate
 *
 * @param params {SwapParams} - swap parameters
 *
 * @returns swap fee amount
 *
 * @example
 *
 * const inputAmount = Amount(200000000000000);
 * const inputBalanceInPool = Amount(1999800619938006200);
 * const outputBalanceInPool = Amount(2000200000000000000);
 * const swapFeeRate = Amount(0.003);
 * const currentRatioShiftingRate = Amount(0);
 *
 * calculateSwapFeeFromRowan({
 *  inputAmount,
 *  inputBalanceInPool,
 *  outputBalanceInPool,
 *  swapFeeRate,
 *  currentRatioShiftingRate
 * });
 */
export function calculateSwapFeeFromRowan({
  inputAmount: x,
  inputBalanceInPool: X,
  outputBalanceInPool: Y,
  swapFeeRate: f,
  currentRatioShiftingRate: r,
}: SwapParams) {
  // consider the formula:
  // f * (1 + r) * x * Y / (x + X)
  const term1 = f.multiply(ONE.add(r)); // f * (1 + r)
  const term2 = x.multiply(Y); // x * Y
  const term3 = x.add(X); // (x + X)

  return term1.multiply(term2).divide(term3);
}

/**
 * Calculate Swap Amount from EXTERNAL ASSET to ROWAN based on formula:
 * - (1 - f) * x * Y / ((x + X)(1 + r))
 *
 * where:
 * - f is the swap fee rate
 * - x is the input amount
 * - X is the balance of input token in the pool
 * - Y is the balance of output token in the pool
 * - r is the current ratio shifting running rate
 *
 * @param params {SwapParams} - swap parameters
 *
 * @returns amount obtained from swap
 *
 * @example
 *
 * const inputAmount = Amount(200000000000000);
 * const inputBalanceInPool = Amount(1999800619938006200);
 * const outputBalanceInPool = Amount(2000200000000000000);
 * const swapFeeRate = Amount(0.003);
 * const currentRatioShiftingRate = Amount(0);
 *
 * calculateSwapToRowan({
 *  inputAmount,
 *  inputBalanceInPool,
 *  outputBalanceInPool,
 *  swapFeeRate,
 *  currentRatioShiftingRate
 * });
 */
export function calculateSwapToRowan({
  inputAmount: x,
  inputBalanceInPool: X,
  outputBalanceInPool: Y,
  swapFeeRate: f,
  currentRatioShiftingRate: r,
}: SwapParams) {
  // consider the formula:
  // (1 - f) * x * Y / ((x + X)(1 + r))
  const term1 = ONE.subtract(f); // (1 - f)
  const term2 = x.multiply(Y); // x * Y
  const term3 = x.add(X); // (x + X)
  const term4 = ONE.add(r); // (1 + r)

  return term1.multiply(term2).divide(term3.multiply(term4));
}

/**
 * Calculate Swap Fee from EXTERNAL ASSET to ROWAN based on formula:
 * - f * x * Y / ((x + X)(1 + r))
 *
 * where:
 * - f is the swap fee rate
 * - x is the input amount
 * - X is the balance of input token in the pool
 * - Y is the balance of output token in the pool
 * - r is the current ratio shifting running rate
 *
 * @param params {SwapParams} - swap parameters
 *
 * @returns swap fee amount
 *
 * @example
 *
 * const inputAmount = Amount(200000000000000);
 * const inputBalanceInPool = Amount(1999800619938006200);
 * const outputBalanceInPool = Amount(2000200000000000000);
 * const swapFeeRate = Amount(0.003);
 * const currentRatioShiftingRate = Amount(0);
 *
 * calculateSwapFeeToRowan({
 *  inputAmount,
 *  inputBalanceInPool,
 *  outputBalanceInPool,
 *  swapFeeRate,
 *  currentRatioShiftingRate
 * });
 */
export function calculateSwapFeeToRowan({
  inputAmount: x,
  inputBalanceInPool: X,
  outputBalanceInPool: Y,
  swapFeeRate: f,
  currentRatioShiftingRate: r,
}: SwapParams) {
  // consider the formula:
  // f * x * Y / ((x + X)(1 + r))
  const term1 = f.multiply(x).multiply(Y); // f * x * Y
  const term2 = x.add(X); // (x + X)
  const term3 = ONE.add(r); // (1 + r)

  return term1.divide(term2.multiply(term3));
}

export const calculateSwap = (params: SwapParams, toRowan: boolean) => {
  const fn = toRowan ? calculateSwapToRowan : calculateSwapFromRowan;

  return fn(params);
};

export const calculateSwapFee = (params: SwapParams, toRowan: boolean) => {
  const fn = toRowan ? calculateSwapFeeToRowan : calculateSwapFeeFromRowan;

  return fn(params);
};

export const calculateSwapWithFee = (params: SwapParams, toRowan: boolean) => ({
  swap: calculateSwap(params, toRowan),
  fee: calculateSwapFee(params, toRowan),
});
