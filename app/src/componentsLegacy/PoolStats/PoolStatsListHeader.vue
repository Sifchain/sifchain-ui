<script>
import { defineComponent } from "vue";
import Tooltip from "@/componentsLegacy/Tooltip/Tooltip.vue";
import Icon from "@/componentsLegacy/Icon/Icon.vue";

export default defineComponent({
  components: {
    Tooltip,
    Icon,
  },
});
</script>

<template>
  <div class="header pool-stats-list-header">
    <div class="col-sm col-sm-s">
      <span>Token</span>
    </div>
    <div class="col-lg">
      <span>Price of Token</span>
      <span>
        (USD)
        <Tooltip message="This is the current price of 1 TKN in USDT.">
          <Icon icon="info-box-white" />
        </Tooltip>
      </span>
    </div>

    <div class="col-lg">
      <span>Arbitrage</span>
      <span>
        Opportunity
        <Tooltip
          message="This is the arbitrage opportunity available based on a differential between the price of this token on Sifchain and its price on CoinMarketCap. If the percentage is green, it means the token is currently cheaper in Sifchain than CoinMarketCap."
        >
          <Icon icon="info-box-white" />
        </Tooltip>
      </span>
    </div>
    <div class="col-lg">
      <span>Pool Depth</span>
      <span>
        (USD)
        <Tooltip
          message="Total value of the external token in the pool in USD."
        >
          <Icon icon="info-box-white" />
        </Tooltip>
      </span>
    </div>
    <div class="col-lg">
      <span>Trade Volume</span>
      <span>(24h)</span>
    </div>
    <div class="col-sm">
      <span>
        Pool APY
        <Tooltip
          message="Annual percentage return earned by providing liquidity to this pool."
        >
          <Icon icon="info-box-white" />
        </Tooltip>
      </span>
    </div>
    <div class="col-lg">
      <span>Liquidity Mining Bonus</span>

      <span>
        APY&nbsp;
        <Tooltip
          message="Annual percentage return earned via our Liquidity mining program for providing liquidity to this pool. "
        >
          <Icon icon="info-box-white" />
        </Tooltip>
      </span>
    </div>
    <div class="col-sm">
      <span>
        Total APY
        <Tooltip
          message="Total APY earned (Pool + Liquidity Mining) by providing liquidity to this pool."
        >
          <Icon icon="info-box-white" />
        </Tooltip>
      </span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.header {
  padding: 2em 1em;
  min-height: 64px;
  background: $c_gray_900;
  display: flex;
  justify-content: space-evenly;
  align-items: center;

  &:hover {
    cursor: pointer;
    background: $c_gray_800;
  }
}

.col-sm {
  min-width: 102px;
  color: $c_gray_400;
  display: flex;
  flex-direction: column;
  &.col-sm-s {
    min-width: 112px;
    padding-left: 12px;
  }
  span {
    display: flex;
    justify-content: center;
    .tooltip {
      cursor: pointer;
      position: relative;
      padding-left: 5px;
      padding-top: 3px;
    }
  }
}

.col-md {
  min-width: 110px;
  color: $c_gray_400;
  display: flex;
  flex-direction: column;
}
.col-lg {
  min-width: 168px;
  color: $c_gray_400;
  display: flex;
  flex-direction: column;
  span {
    display: flex;
    justify-content: center;
    .tooltip {
      padding-left: 5px;
      padding-top: 3px;
    }
  }
}
</style>
<style lang="scss">
.pool-stats-list-header .icon-wrapper {
  margin-left: 4px;
  svg {
    width: 16px !important;
    height: 16px !important;
  }
}
</style>
