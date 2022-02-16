import {
  calculateExternalExternalSwapResult,
  calculateSwapResult,
  calculateSwapResult_ptmp,
} from "./formulae";
import { Amount } from "./Amount";
import tests from "../../../../test/test-tables/singleswap_result.json";

tests.SingleSwapResult.forEach(({ x, X, Y, bX, bY, expected }: any) => {
  test(`Swapping ${x}, expecting ${expected}`, () => {
    const output = calculateSwapResult_ptmp(
      // External -> Native pool
      Amount(x), // Swap Amount
      Amount(X), // External Balance
      Amount(Y), // Native Balance,
      0.4,
      0.6,
    );
    expect(output.toBigInt().toString()).toBe(expected);
  });
});
