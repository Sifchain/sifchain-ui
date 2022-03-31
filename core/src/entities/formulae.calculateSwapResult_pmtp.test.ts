import { Amount } from "./Amount";
import { calculateSwapResult_pmtp } from "./formulae";

import tests from "../../../test/test-tables/singleswap_result.json";

import { sanitizeNumericString } from "../test/utils/sanitizeNumericString";

const toAmount = (s: string) => Amount(sanitizeNumericString(s));

describe("calculateSwapResult_pmtp", () => {
  tests.SingleSwapResult_pmtp.forEach(({ x, X, Y, A, expected }) => {
    test(`Swapping (${x}), expecting (${expected})`, () => {
      const [$x, $X, $Y, $A] = [x, X, Y, A].map(toAmount);

      const output = calculateSwapResult_pmtp(
        // External -> Native pool
        $X, // External Balance
        $x, // Swap Amount
        $Y, // Native Balance,
        $A, // PMTP adjustment (increased purchasing power)
      );
      expect(output.toBigInt().toString()).toBe(expected);
    });
  });
});
