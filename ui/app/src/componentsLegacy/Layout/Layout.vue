<template>
  <div
    class="layout flex absolute justify-center portrait:left-0 left-sidebar top-0 right-0 bottom-0 bg-gray-background"
  >
    <slot></slot>
    <div id="modal-target"></div>
    <BetaWarningBanner />
  </div>
  <!-- <Footer /> -->
  <div class="layout-bg" />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Panel from "@/componentsLegacy/Panel/Panel.vue";
import Footer from "@/componentsLegacy/Footer/Footer.vue";
import PanelNav from "@/componentsLegacy/PanelNav/PanelNav.vue";
import Icon from "@/componentsLegacy/Icon/Icon.vue";
import BetaWarningBanner from "@/components/BetaWarningBanner";
import { SubHeading } from "@/componentsLegacy/Text";

export default defineComponent({
  // components: { Panel, PanelNav, Icon, SubHeading, Footer },
  components: { BetaWarningBanner },
  props: {
    backLink: String,
    header: { type: Boolean, default: true },
    emitBack: {
      type: Boolean,
      default: false,
    },
    title: String,
  },
});
</script>

<style lang="scss" scoped>
.layout {
  box-sizing: border-box;
  background-color: rgba(0, 0, 0, 0.4);
  overflow-y: scroll;
}

.layout-bg {
  background: url("../../assets/World_Background_opt.jpg");
  background-size: cover;
  background-position: top center;
  background-attachment: fixed;
  // filter: blur(10px);

  z-index: -1;
  width: 100%;
  height: 100vh; /* TODO: header height */
  position: fixed;
  top: 0;
  left: 0;
}
</style>
