import { ref } from "vue";
import { TippyComponent } from "vue-tippy";

const appWalletRef = ref<TippyComponent | null>(null);

export const useAppWalletPicker = () => {
  const isOpen = ref(false);
  return {
    ref: appWalletRef,
    isOpen,
    show() {
      appWalletRef.value?.show();
    },
  };
};
