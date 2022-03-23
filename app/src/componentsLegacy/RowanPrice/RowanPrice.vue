<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  components: {},
  data() {
    return {
      polling: undefined as ReturnType<typeof setTimeout> | undefined,
      rowanUSD: "",
    };
  },
  methods: {
    async pollData() {
      function isNumeric(s: any) {
        return s - 0 == s && ("" + s).trim().length > 0;
      }
      const data = await fetch(
        "https://vtdbgplqd6.execute-api.us-west-2.amazonaws.com/default/tokenstats",
      );
      const json = await data.json();
      const rowanPriceInUSDT = json.body ? json.body.rowanUSD : "";

      if (isNumeric(rowanPriceInUSDT)) {
        this.rowanUSD =
          "ROWAN: $" + parseFloat(rowanPriceInUSDT).toPrecision(6);
      }
    },
  },
  created() {
    this.pollData();
    this.polling = setInterval(() => this.pollData(), 10000);
  },
  unmounted() {
    if (!this.polling) return;
    clearInterval(this.polling);
  },
});
</script>

<template>
  <div class="container">
    <div v-if="rowanUSD" class="rowan">
      <Pill color="primary">
        <img class="image" src="/images/siflogo.png" />
        <div>
          {{ rowanUSD }}
        </div>
      </Pill>
    </div>
  </div>
</template>

<style lang="scss">
.container .primary img {
  margin-top: 2px;
}
</style>
<style lang="scss" scoped>
.rowan {
  .image {
    height: 16px;
    margin-right: 4px;
  }
}
</style>
