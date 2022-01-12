import { defineComponent } from "vue";
import Layout from "@/componentsLegacy/Layout/Layout";

import { RewardsCalculator } from "./components/RewardsCalculator/RewardsCalculator";

export default defineComponent({
  name: "RewardsCalculatorPage",
  setup() {
    const data = useRewardsCalculatorData();
    return {
      ...data,
      originalAPR: data.apr,
      originalPrice: data.tokenOutPrice,
      tokenOutFuturePrice: "0.15",
    };
  },
  methods: {
    handleApplyMaxBalance() {
      this.tokenInAmount = this.tokenInBalance;
      this.$forceUpdate();
    },
    handleTokenInAmountChange(value: string) {
      this.tokenInAmount = value;
      this.$forceUpdate();
    },
    handleTimeInWeeksChange(value: number) {
      this.timeInWeeks = value;
      this.$forceUpdate();
    },
    handleResetAPR() {
      this.apr = this.originalAPR;
    },
    handleResetPriceAtPurchase() {
      this.tokenOutPrice = this.originalPrice;
    },
    handleResetFuturePrice() {
      this.tokenOutFuturePrice = this.originalPrice;
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
          tokenOutSymbol={this.tokenOutSymbol}
          timeInWeeks={this.timeInWeeks}
          apr={this.apr}
          onApplyMaxBalance={this.handleApplyMaxBalance}
          onTokenInAmountChange={this.handleTokenInAmountChange}
          onTimeInWeeksChage={this.handleTimeInWeeksChange}
          onResetAPR={this.handleResetAPR}
          onResetFuturePrice={this.handleResetFuturePrice}
          onResetPriceAtPurchase={this.handleResetPriceAtPurchase}
        />
      </Layout>
    );
  },
});

export function useRewardsCalculatorData() {
  return {
    tokenInSymbol: "ROWAN",
    tokenInBalance: "2000",
    tokenInAmount: "0",
    tokenOutPrice: "0.15",

    tokenOutSymbol: "ROWAN",
    timeInWeeks: 1,
    apr: "12.5",
  };
}
