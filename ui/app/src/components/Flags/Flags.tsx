import { useCore } from "@/hooks/useCore";
import { flagsStore } from "@/store/modules/flags";
import { defineComponent, watch } from "@vue/runtime-core";
import { onMounted, ref } from "vue";
import { Button } from "../Button/Button";

const isProduction = import.meta.env.VITE_APP_DEPLOYMENT === "production";

// TODO: figure out how to dynamic import this
// while working with our inline-everything HTML plugin
// const loadGui = async () => {
//   return (await import("./flagsGui")).createGui;
// };

import { createGui } from "./flagsGui";
const loadGui = () => createGui;

export const Flags = defineComponent({
  name: "FlagsGui",
  setup() {
    if (isProduction) return null;

    const guiRef = ref<dat.GUI>();

    watch(flagsStore.state, () => flagsStore.persist(), { deep: true });

    watch(flagsStore.refs.ibcTransferTimeoutMinutes.computed(), (timeout) => {
      useCore().services.ibc.transferTimeoutMinutes = timeout;
    });

    const toggleGui = async () => {
      if (!guiRef.value) {
        const createGui = await loadGui();
        guiRef.value = createGui();
        document.body.appendChild(guiRef.value.domElement);
      } else {
        guiRef.value.domElement.remove();
        guiRef.value.destroy();
        guiRef.value = undefined;
      }
    };

    return () => (
      <Button.Inline
        icon="interactive/settings"
        class="fixed top-[8px] right-[8px]"
        onClick={toggleGui}
      />
    );
  },
});
