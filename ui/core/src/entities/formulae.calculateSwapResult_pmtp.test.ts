import { calculateSwapResult_pmtp } from "./formulae";
import { Amount } from "./Amount";
import tests from "../../../../test/test-tables/singleswap_result.json";
import { sanitizeNumberString } from "test/utils/sanitizeNumberString";

const toAmount = (s: string) => Amount(sanitizeNumberString(s));

describe("calculateSwapResult_pmtp", () => {
  tests.SingleSwapResult_pmtp.forEach(({ x, X, Y, wx, wy, expected }) => {
    test(`Swapping ${x}, expecting ${expected}`, () => {
      const $x = toAmount(x); // Swap Amount
      const $X = toAmount(X); // External Balance
      const $Y = toAmount(Y); // Native Balance

      const output = calculateSwapResult_pmtp(
        // External -> Native pool
        $x, // Swap Amount
        $X, // External Balance
        $Y, // Native Balance,
        wx,
        wy,
      );
      expect(output.toBigInt().toString()).toBe(expected);
    });
  });
});
