import { Amount } from "./Amount";
import { calculateSwapResult_pmtp } from "./formulae";
import tests from "../../../../test/test-tables/singleswap_result.json";

import { sanitizeNumericString } from "../test/utils/sanitizeNumericString";

const toAmount = (s: string) => Amount(sanitizeNumericString(s));

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
