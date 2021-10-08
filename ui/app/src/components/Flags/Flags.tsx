import { useCore } from "@/hooks/useCore";
import { flagsStore } from "@/store/modules/flags";
import { defineComponent, watch } from "@vue/runtime-core";
import { onMounted, ref } from "vue";
import { Button } from "../Button/Button";

const isProduction =
  import.meta.env.VITE_APP_DEPLOYMENT === "production" ||
  location.hostname == "dex.sifchain.finance";

console.log({ global });
// TODO: figure out how to dynamic import this
// while working with our inline-everything HTML plugin
// const loadGui = async () => {
//   return (await import("./flagsGui")).createGui;
// };

import { createGui } from "./flagsGui";
const loadGui = () => createGui;

export const Flags = defineComponent({
  name: "FlagsGui",
  data(): {
    gui: null | ReturnType<typeof createGui>;
  } {
    console.log({ isProduction });
    return {
      gui: null,
    };
  },
  methods: {
    async toggleGui() {
      if (!this.gui) {
        const createGui = await loadGui();
        this.gui = createGui();
        document.body.appendChild(this.gui.domElement);
        this.gui.domElement.className = this.gui.domElement.className.replace(
          "main",
          "",
        );
      } else {
        this.gui.domElement.remove();
        this.gui.destroy();
        this.gui = null;
      }
    },
  },
  computed: {
    flagsState() {
      return flagsStore.state;
    },
    timeoutMinutes() {
      return flagsStore.refs.ibcTransferTimeoutMinutes;
    },
  },
  watch: {
    flagsState: {
      handler() {
        flagsStore.persist();
      },
      deep: true,
    },
    timeoutMinutes: {
      handler(timeout) {
        useCore().services.ibc.transferTimeoutMinutes =
          timeout?.computed?.()?.value ?? timeout;
      },
      immediate: true,
    },
  },
  render() {
    if (isProduction) return null;
    return (
      <Button.Inline
        icon="interactive/settings"
        class="fixed top-[8px] right-[8px]"
        onClick={() => this.toggleGui()}
      />
    );
  },
});
