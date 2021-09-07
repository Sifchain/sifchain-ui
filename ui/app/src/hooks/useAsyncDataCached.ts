import { ComputedRef, computed, watchEffect, watch } from "vue";
import { useAsyncData, AsyncDataState } from "./useAsyncData";

const cache = new Map<string, any>();

export const useAsyncDataCached = <F extends () => Promise<any>>(
  cacheKey: string,
  fn: F,
  deps: any[] = [],
) => {
  if (!cache.has(cacheKey)) {
    cache.set(cacheKey, useAsyncData(fn, deps));
  }
  const state = cache.get(cacheKey) as AsyncDataState<F>;

  watch(deps, () => {
    state.reload.value();
  });

  return state;
};
