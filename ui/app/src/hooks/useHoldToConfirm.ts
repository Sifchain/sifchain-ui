import {
  computed,
  ComputedRef,
  nextTick,
  onBeforeUnmount,
  onMounted,
  proxyRefs,
  ref,
  Ref,
  watch,
} from "vue";

export const useHoldToConfirm = (
  callback: () => any,
  params: {
    holdDurationMs: number;
  },
) => {
  const heldForMs = ref(0);
  const state = ref<"idle" | "holding" | "confirmed">("idle");
  const interval = ref<number | undefined>();
  return {
    state,
    onMouseDown() {
      heldForMs.value = 0;
      state.value = "holding";
      interval.value = window.setInterval(() => {
        heldForMs.value = heldForMs.value + 100;
        if (heldForMs.value >= params.holdDurationMs) {
          state.value = "confirmed";
          nextTick(() => {
            callback();
            // state.value = "idle";
          });
        }
      }, 100);
    },
    onMouseUp() {
      window.clearInterval(interval.value);
      interval.value = undefined;
      state.value = "idle";
      heldForMs.value = 0;
    },
  };
};
