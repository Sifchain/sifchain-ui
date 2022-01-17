import { defineComponent } from "vue";

import { formatAssetAmount } from "@/componentsLegacy/shared/utils";
import Layout from "@/componentsLegacy/Layout/Layout";

import { RewardsCalculator } from "./components/RewardsCalculator";
import { useRewardsCalculatorData } from "./hooks";

export default defineComponent({
  name: "RewardsCalculatorPage",
  setup() {
    const data = useRewardsCalculatorData();

    return {
      ...data,
      currentAPR: data.apr,
      tokenOutCurrentPrice: "0",
      tokenOutPriceAtPurchase: "0",
      tokenOutFuturePrice: "0",
      tokenInAmount: "0",
      timeInWeeks: 1,
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
    handleAPRChange(value: string) {
      this.apr = value;
      this.$forceUpdate();
    },
    handleResetAPR() {
      this.apr = this.currentAPR;
      this.$forceUpdate();
    },
    handleTokenOutPriceAtPurchaseChange(value: string) {
      this.tokenOutPriceAtPurchase = value;
      this.$forceUpdate();
    },
    handleResetTokenOutPriceAtPurchase() {
      this.tokenOutPriceAtPurchase = this.tokenOutCurrentPrice;
      this.$forceUpdate();
    },
    handleTokenOutFuturePriceChange(value: string) {
      this.tokenOutFuturePrice = value;
      this.$forceUpdate();
    },
    handleResetTokenOutFuturePrice() {
      this.tokenOutFuturePrice = this.tokenOutCurrentPrice;
      this.$forceUpdate();
    },
  },
  computed: {
    tokenOutPrice() {
      if (this.tokenOutPriceAsync.isSuccess.value) {
        return String(
          // @ts-ignore
          this.tokenOutPriceAsync.data.value,
        );
      }
      return "0";
    },
    tokenInBalance() {
      if (this.tokenInBalanceAsync.isSuccess.value) {
        // @ts-ignore
        return formatAssetAmount(this.tokenInBalanceAsync?.data?.value);
      }
      return "0";
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
          onApplyMaxBalance={this.handleApplyMaxBalance}
          onTokenInAmountChange={this.handleTokenInAmountChange}
          onTimeInWeeksChage={this.handleTimeInWeeksChange}
          onAPRChange={this.handleAPRChange}
          onResetAPR={this.handleResetAPR}
          onResetTokenOutFuturePrice={this.handleResetTokenOutFuturePrice}
          onTokenOutPriceAtPurchaseChange={
            this.handleTokenOutPriceAtPurchaseChange
          }
          onResetTokenOutPriceAtPurchase={
            this.handleResetTokenOutPriceAtPurchase
          }
          onTokenOutFuturePriceChange={this.handleTokenOutFuturePriceChange}
        />
      </Layout>
    );
  },
});
