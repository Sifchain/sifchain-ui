<script lang="ts">
import { defineComponent } from "vue";
import { useCore } from "@/hooks/useCore";
import Layout from "@/componentsLegacy/Layout/Layout";
import PoolStatsList from "@/componentsLegacy/PoolStats/PoolStatsList.vue";
import PoolStatsListHeader from "@/componentsLegacy/PoolStats/PoolStatsListHeader.vue";

export default defineComponent({
  components: {
    Layout,
    PoolStatsList,
    PoolStatsListHeader,
  },
  data() {
    return {
      poolData: {},
      liqAPY: 0,
    };
  },
  async mounted() {
    const data = await fetch(
      "https://data.sifchain.finance/beta/asset/tokenStats",
    );
    const json = await data.json();
    this.poolData = json.body;

    const { services } = useCore();

    const lmJson: any = await services.cryptoeconomics.fetchData({
      rewardType: "lm",
      address: "sif100snz8vss9gqhchg90mcgzkjaju2k76y7h9n6d",
      key: "userData",
      timestamp: "now",
    });

    this.liqAPY = lmJson ? lmJson.user.currentAPYOnTickets * 100 : 0;
  },
});
</script>

<template>
  <div class="layout">
    <PoolStatsList :poolData="poolData" :liqAPY="liqAPY" />
  </div>
</template>

<style scoped lang="scss">
.layout {
  background: url("../assets/World_Background_opt.jpg");
  background-size: cover;
  background-position: bottom center;
  box-sizing: border-box;
  padding-top: $header_height;
  padding-right: 32px;
  padding-left: 32px;
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
