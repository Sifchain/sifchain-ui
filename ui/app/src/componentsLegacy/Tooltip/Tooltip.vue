<script>
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    fit: Boolean,
    message: {
      type: String,
    },
    hidden: {
      type: Boolean,
    },
    hover: {
      type: Boolean,
    },
  },
  setup: function (props) {
    const { fit } = props;
    const classes = {
      "tooltip-container-fit": fit,
      "tooltip-container": true,
    };

    return { fit, classes };
  },
  data: function () {
    return {
      opened: false,
      containerLocation: { left: 0, bottom: 0 },
    };
  },
  methods: {
    close() {
      this.opened = false;
    },
    open() {
      const element = this.$refs.trigger;
      const bounds = element.getBoundingClientRect();
      const scrollY = window.scrollY || window.pageYOffset;
      const scrollX = window.scrollX || window.pageXOffset;
      const topPos = bounds.top + scrollY;
      const leftPos = bounds.left + bounds.width + scrollX;

      this.containerLocation.top = `${topPos}px`;
      this.containerLocation.left = `${leftPos}px`;

      this.opened = true;
    },
    mouseenter() {
      if (this.$props.hover) {
        this.open();
      }
    },
    mouseleave() {
      if (this.$props.hover && this.opened) {
        this.close();
      }
    },
  },
});
</script>

<template>
  <span v-if="!hidden" v-on:click="open()">
    <teleport to="#tooltip-target">
      <div
        class="tooltip-background"
        v-if="opened"
        @click="close"
        @mouseenter="mouseenter"
        @mouseleave="mouseleave"
      >
        <div class="tooltip-positioner" :style="containerLocation" @click.stop>
          <div :class="classes">
            <div class="tooltip-inner">
              {{ message }}
              <slot name="message"></slot>
            </div>
          </div>
        </div>
      </div>
    </teleport>
    <span class="tooltip-trigger trigger" :data-opened="opened" ref="trigger">
      <slot></slot>
    </span>
  </span>
  <slot v-else />
</template>

<style lang="scss" scoped>
.tooltip-background {
  position: absolute;
  z-index: 1000000000;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
}
.tooltip-positioner {
  position: absolute;
}
.tooltip-container {
  transform: translateY(-100%);
  @apply bg-gray-base text-white rounded-sm text-base;
  text-align: left;
  z-index: 10000;
  width: 210px;
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.4);
  .tooltip-inner {
    padding: 8px 12px;
  }
}
.trigger {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.tooltip-container-fit {
  width: auto !important;
}
</style>
