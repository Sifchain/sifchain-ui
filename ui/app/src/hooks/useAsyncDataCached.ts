import { ComputedRef, computed, watchEffect } from "vue";
import _ from "lodash";
import { useAsyncData, AsyncDataState } from "./useAsyncData";

const cache = new Map<string, any>();

export const useAsyncDataCached = <F extends () => Promise<any>>(
  cacheKey: string,
  fn: F,
  shouldReload: ComputedRef<boolean> = computed(() => false),
) => {
  if (!cache.has(cacheKey)) {
    cache.set(cacheKey, useAsyncData(fn, shouldReload));
  }
  const state = cache.get(cacheKey) as AsyncDataState<F>;

  watchEffect(() => {
    if (shouldReload.value) {
      state.reload.value();
    }
  });

  return state;
};
