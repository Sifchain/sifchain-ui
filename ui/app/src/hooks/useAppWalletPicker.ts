import Tippy from "@/components/Tooltip";
import { ref } from "vue";
import { TippyComponent } from "vue-tippy";

const appWalletRef = ref<TippyComponent | null>(null);

export const useAppWalletPicker = () => {
  return {
    ref: appWalletRef,
    show() {
      appWalletRef.value?.show();
    },
  };
};
