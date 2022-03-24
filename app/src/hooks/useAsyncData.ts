import { onMounted, watch, ref, Ref } from "vue";

export type AsyncDataState<F extends () => Promise<any>> = {
  data: Ref<Await<ReturnType<F>> | null>;
  error: Ref<Error | null>;
  isError: Ref<boolean>;
  isSuccess: Ref<boolean>;
  isLoading: Ref<boolean>;
  reload: Ref<() => void>;
};

const DEFAULT_OPTIONS = {
  maxRetries: 3,
  retryDelay: 1000,
};

type Await<T> = T extends {
  then(onfulfilled?: (value: infer U) => unknown): unknown;
}
  ? U
  : T;

export const useAsyncData = <F extends () => Promise<any>>(
  fn: F,
  deps: any[] = [],
  options = DEFAULT_OPTIONS,
) => {
  const publicState: AsyncDataState<F> = {
    data: ref(null),
    error: ref<any>(null),
    isError: ref(false),
    isSuccess: ref(false),
    isLoading: ref(false),
    reload: ref(loadData),
  };

  const privateState = {
    hasRun: ref(false),
    retryCount: ref(0),
  };

  async function loadData() {
    publicState.isLoading.value = true;

    try {
      const data = await fn();
      publicState.data.value = data;
      publicState.isSuccess.value = true;
      publicState.isLoading.value = false;
      privateState.retryCount.value = 0;
    } catch (error) {
      if (privateState.retryCount.value < options.maxRetries) {
        privateState.retryCount.value++;

        if (process.env.NODE_ENV === "development") {
          console.log("useAsyncData retry:", privateState.retryCount.value);
        }
        setTimeout(
          loadData,
          options.retryDelay * privateState.retryCount.value,
        );
        return;
      }
      if (process.env.NODE_ENV === "development") {
        console.error("useAsyncData error", error);
      }
      publicState.isError.value = true;
      publicState.isLoading.value = false;
      publicState.error.value = error as Error;
    }
  }

  if (deps.length > 0) {
    watch(deps, loadData, { immediate: true });
  }

  onMounted(() => {
    if (!privateState.hasRun.value) {
      privateState.hasRun.value = true;
      loadData();
    }
  });

  return publicState;
};
