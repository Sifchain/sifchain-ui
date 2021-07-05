import { computed, ComputedRef } from "@vue/reactivity";
import { reactive, readonly, toRefs, watchEffect } from "vue";
const cache: Record<string, any> = {};

export const useAsyncData = <F extends () => Promise<any>>(
  fn: F,
  shouldReload: ComputedRef<boolean> = computed(() => false),
) => {
  const publicState = reactive({
    data: null,
    error: null,
    isError: false,
    isSuccess: false,
    isLoading: true,
    reload: loadData,
  });
  function loadData() {
    fn()
      .then((data) => {
        publicState.data = data;
        publicState.isSuccess = true;
        publicState.isLoading = false;
      })
      .catch((e) => {
        publicState.isError = true;
        publicState.isLoading = false;
        publicState.error = e;
      });
  }
  const privateState = reactive({
    hasRun: false,
  });

  watchEffect(() => {
    if (!privateState.hasRun || shouldReload.value) {
      privateState.hasRun = true;
      loadData();
    }
  });
  return publicState;
};
