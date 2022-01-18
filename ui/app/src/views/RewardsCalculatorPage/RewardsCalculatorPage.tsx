import { defineComponent } from "vue";

import { accountStore } from "@/store/modules/accounts";
import Layout from "@/componentsLegacy/Layout/Layout";
import { formatAssetAmount } from "@/componentsLegacy/shared/utils";

import { RewardsCalculator } from "./components/RewardsCalculator";
import { useRewardsCalculatorData } from "./hooks";

const DEFAULT_APR = "100";
const DEFAULT_TOKEN_SYMBOL = "ROWAN";

export default defineComponent({
  name: "RewardsCalculatorPage",
  data() {
    return {
      tokenInSymbol: DEFAULT_TOKEN_SYMBOL,
      tokenOutSymbol: DEFAULT_TOKEN_SYMBOL,
      apr: DEFAULT_APR,
      currentAPR: DEFAULT_APR,
      tokenOutCurrentPrice: "0",
      tokenOutPriceAtPurchase: "0",
      tokenOutFuturePrice: "0",
      tokenInAmount: "0",
      timeInWeeks: 1,
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
      return parseFloat(this.tokenInAmount) * parseFloat(this.tokenOutPrice);
    },
    currentWealth(): number {
      return parseFloat(this.tokenInBalance) * parseFloat(this.tokenOutPrice);
    },
    potentialReturn(): number {
      const apr = parseFloat(this.apr) / 100;

      const compoundReturn = Array(this.timeInWeeks)
        .fill(0)
        .reduce((acc) => acc + (acc * apr) / 52, this.investment);

      return compoundReturn;
    },
    rewardsEstimate(): number {
      return (
        (this.potentialReturn - this.investment) /
        parseFloat(this.tokenOutFuturePrice)
      );
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
