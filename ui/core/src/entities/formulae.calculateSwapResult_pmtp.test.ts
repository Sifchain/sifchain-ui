import { calculateSwapResult_pmtp } from "./formulae";
import { Amount } from "./Amount";
import tests from "../../../../test/test-tables/singleswap_result.json";

const sanitize = (x: string) => x.replace(/\_/g, "");

describe("calculateSwapResult_pmtp", () => {
  tests.SingleSwapResult_pmtp.forEach(({ x, X, Y, wx, wy, expected }) => {
    test(`Swapping ${x}, expecting ${expected}`, () => {
      const $x = Amount(sanitize(x)); // Swap Amount
      const $X = Amount(sanitize(X)); // External Balance
      const $Y = Amount(sanitize(Y)); // Native Balance

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
