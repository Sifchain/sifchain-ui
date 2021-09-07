import { computed, ComputedRef, ref, Ref } from "@vue/reactivity";
import { onMounted, reactive, readonly, toRefs, watch, watchEffect } from "vue";
const cache: Record<string, any> = {};

export type AsyncDataState<F extends () => Promise<any>> = {
  data: Ref<Await<ReturnType<F>> | null>;
  error: Ref<Error | null>;
  isError: Ref<boolean>;
  isSuccess: Ref<boolean>;
  isLoading: Ref<boolean>;
  reload: Ref<() => void>;
};

type Await<T> = T extends {
  then(onfulfilled?: (value: infer U) => unknown): unknown;
}
  ? U
  : T;
export const useAsyncData = <F extends () => Promise<any>>(
  fn: F,
  deps: any[] = [],
) => {
  const publicState: AsyncDataState<F> = {
    data: ref(null),
    error: ref<any>(null),
    isError: ref(false),
    isSuccess: ref(false),
    isLoading: ref(false),
    reload: ref(loadData),
  };

  function loadData() {
    publicState.isLoading.value = true;
    fn()
      .then((data) => {
        publicState.data.value = data;
        publicState.isSuccess.value = true;
        publicState.isLoading.value = false;
      })
      .catch((e) => {
        console.error("useAsyncData error", e);
        publicState.isError.value = true;
        publicState.isLoading.value = false;
        publicState.error.value = e;
      });
  }
  const privateState = {
    hasRun: ref(false),
  };

  watch(
    deps,
    () => {
      loadData();
    },
    { immediate: true },
  );

  onMounted(() => {
    if (!privateState.hasRun.value) {
      privateState.hasRun.value = true;
      loadData();
    }
  });

  return publicState;
};
