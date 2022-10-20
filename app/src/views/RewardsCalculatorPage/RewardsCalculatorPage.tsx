import { defineComponent } from "vue";

import { accountStore } from "~/store/modules/accounts";
import Layout from "~/components/Layout";
import { formatAssetAmount } from "~/components/utils";

import { RewardsCalculator } from "./components/RewardsCalculator";
import { useRewardsCalculatorData } from "./hooks";

const DEFAULT_TOKEN_SYMBOL = "ROWAN";
const DEFAULT_APR = "200";
const DEFAULT_TIME_IN_WEEKS = 12;
const COMPOUNDING_FACTOR = {
  daily: 365,
  weekly: 52,
  monthly: 12,
  yearly: 1,
} as const;

/**
 * Calculates future value based on compounding rate and period
 *
 * Formula: FV=PV*(1+r/m)^m*t;
 * source: https://www.calculatorsoup.com/calculators/financial/future-value-investment-calculator.php
 *
 * @param presentValue
 * @param periods
 * @param interestPerPeriod
 * @param compounding
 * @returns
 */
export function calculateFutureValue(
  presentValue: number,
  periods: number,
  interestPerPeriod: number,
  compounding: number,
) {
  return (
    presentValue *
    (1 + interestPerPeriod / compounding) ** (compounding * periods)
  );
}

export default defineComponent({
  name: "RewardsCalculatorPage",
  data() {
    return {
      tokenInSymbol: DEFAULT_TOKEN_SYMBOL,
      tokenOutSymbol: DEFAULT_TOKEN_SYMBOL,
      apr: DEFAULT_APR,
      currentAPR: DEFAULT_APR,
      timeInWeeks: DEFAULT_TIME_IN_WEEKS,
      tokenOutCurrentPrice: "0",
      tokenOutPriceAtPurchase: "0",
      tokenOutFuturePrice: "0",
      tokenInAmount: "0",
    };
  },
  setup() {
    return useRewardsCalculatorData();
  },
  computed: {
    tokenOutPrice(): string {
      if (this.tokenOutPriceAsync.isSuccess.value) {
        return String(this.tokenOutPriceAsync.data.value);
      }
      return "0";
    },
    tokenInBalance(): string {
      const { balances } = accountStore.state.sifchain;
      const balance = balances.find(({ asset }) =>
        asset.symbol.toLowerCase().includes(this.tokenInSymbol.toLowerCase()),
      );
      return balance ? formatAssetAmount(balance) : "0";
    },
    investment(): number {
      return (
        parseFloat(this.tokenInAmount) *
        parseFloat(this.tokenOutPriceAtPurchase)
      );
    },
    currentWealth(): number {
      return parseFloat(this.tokenInBalance) * parseFloat(this.tokenOutPrice);
    },
    rewardsEstimate(): number {
      const apr = parseFloat(this.apr) / 100;
      const tokenInAmount = parseFloat(this.tokenInAmount);

      return (
        calculateFutureValue(
          tokenInAmount,
          this.timeInWeeks / COMPOUNDING_FACTOR.weekly,
          apr,
          COMPOUNDING_FACTOR.weekly,
        ) - tokenInAmount
      );
    },
    potentialReturn(): number {
      return this.rewardsEstimate * parseFloat(this.tokenOutFuturePrice);
    },
  },
  watch: {
    tokenOutPrice: {
      handler(value: string) {
        if (value) {
          this.tokenOutCurrentPrice = value;
          this.tokenOutPriceAtPurchase = value;
          this.tokenOutFuturePrice = value;
        }
      },
    },
    tokenInBalance: {
      handler(value: string) {
        if (value) {
          this.tokenInAmount = value;
        }
      },
    },
  },
  render() {
    return (
      <Layout>
        <RewardsCalculator
          tokenInSymbol={this.tokenInSymbol}
          tokenInBalance={this.tokenInBalance}
          tokenInAmount={this.tokenInAmount}
          tokenOutPrice={this.tokenOutPrice}
          tokenOutPriceAtPurchase={this.tokenOutPriceAtPurchase}
          tokenOutFuturePrice={this.tokenOutFuturePrice}
          tokenOutSymbol={this.tokenOutSymbol}
          timeInWeeks={this.timeInWeeks}
          currentAPR={this.currentAPR}
          apr={this.apr}
          // claculated
          investment={this.investment}
          currentWealth={this.currentWealth}
          potentialReturn={this.potentialReturn}
          rewardsEstimate={this.rewardsEstimate}
          // handlers
          onApplyMaxBalance={() => {
            this.tokenInAmount = this.tokenInBalance;
          }}
          onTokenInAmountChange={(value) => {
            this.tokenInAmount = value;
          }}
          onTimeInWeeksChage={(value) => {
            this.timeInWeeks = value;
          }}
          onAPRChange={(value) => {
            this.apr = value;
          }}
          onTokenOutPriceAtPurchaseChange={(value) => {
            this.tokenOutPriceAtPurchase = value;
          }}
          onTokenOutFuturePriceChange={(value) => {
            this.tokenOutFuturePrice = value;
          }}
          onResetAPR={() => {
            this.apr = this.currentAPR;
          }}
          onResetTokenOutPriceAtPurchase={() => {
            this.tokenOutPriceAtPurchase = this.tokenOutCurrentPrice;
          }}
          onResetTokenOutFuturePrice={() => {
            this.tokenOutFuturePrice = this.tokenOutCurrentPrice;
          }}
        />
      </Layout>
    );
  },
});
