<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    color: {
      type: String,
      default: "#d4b553",
    },
    hoverColor: {
      type: String,
      default: "#d4b553",
    },
  },
});
</script>
<template>
  <svg
    class="info-box-icon"
    width="11"
    height="10"
    viewBox="0 0 11 10"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    v-bind:style="{ '--color': color, '--hover-color': hoverColor }"
  >
    <path
      d="M5.00171 -0.000976562C2.24171 -0.000976562 0.00170898 2.23902 0.00170898 4.99902C0.00170898 7.75902 2.24171 9.99902 5.00171 9.99902C7.76171 9.99902 10.0017 7.75902 10.0017 4.99902C10.0017 2.23902 7.76171 -0.000976562 5.00171 -0.000976562ZM5.50171 8.49902H4.50171V7.49902H5.50171V8.49902ZM6.53671 4.62402L6.08671 5.08402C5.72671 5.44902 5.50171 5.74902 5.50171 6.49902H4.50171V6.24902C4.50171 5.69902 4.72671 5.19902 5.08671 4.83402L5.70671 4.20402C5.89171 4.02402 6.00171 3.77402 6.00171 3.49902C6.00171 2.94902 5.55171 2.49902 5.00171 2.49902C4.45171 2.49902 4.00171 2.94902 4.00171 3.49902H3.00171C3.00171 2.39402 3.89671 1.49902 5.00171 1.49902C6.10671 1.49902 7.00171 2.39402 7.00171 3.49902C7.00171 3.93902 6.82171 4.33902 6.53671 4.62402Z"
      fill="currentColor"
    />
  </svg>
</template>
<style lang="scss" scoped>
svg {
  color: var(--color);
}
svg:hover {
  color: var(--hover-color);
}
</style>
<style lang="scss">
.tooltip-trigger[data-opened="true"] .info-box-icon {
  color: var(--hover-color);
}
</style>
