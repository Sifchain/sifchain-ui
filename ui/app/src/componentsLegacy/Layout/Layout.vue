<template>
  <div class="layout h-full w-full flex pl-[210px]">
    <!-- <Panel dark>
      <template v-slot:header v-if="header">
        <PanelNav />
      </template>
      <div class="header" v-if="backLink || title">
        <div v-if="backLink">
          <router-link class="back-link" :to="backLink"
            ><Icon icon="back"
          /></router-link>
        </div>
        <div v-if="emitBack">
          <span @click="$emit('back')" class="back-link"
            ><Icon icon="back"
          /></span>
        </div>
        <div class="title">
          <SubHeading>{{ title }}</SubHeading>
        </div>
      </div>
    </Panel> -->
    <!-- <Panel v-if="!!$slots.after" class="after">
      <slot name="after"></slot>
    </Panel> -->
    <slot></slot>
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
import { SubHeading } from "@/componentsLegacy/Text";

export default defineComponent({
  // components: { Panel, PanelNav, Icon, SubHeading, Footer },
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
  // padding-top: $header_height;
  // padding-left: 131px;
  width: 100vw;
  min-height: 100vmin; /* TODO: header height */
  overflow-y: scroll;
  // display: flex;
  // flex-direction: column;
  // justify-content: center;
  // align-items: center;
  // padding-bottom: 200px;
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
