import type { QueryFunction, QueryKey } from "react-query/types/core";
import { computed, isRef, Ref, unref } from "vue";
import {
  parseQueryArgs,
  useQuery,
  UseQueryOptions,
  UseQueryReturnType,
} from "vue-query";

type Deps = Array<
  | Pick<
      UseQueryReturnType<any, any, any>,
      "isLoading" | "isError" | "isSuccess"
    >
  | Ref<boolean>
>;

// expose correct loading & success flag for dependent queries
export default function useDependentQuery<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  deps: Deps,
  options: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
): UseQueryReturnType<TData, TError>;
export default function useDependentQuery<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  deps: Deps,
  queryKey: QueryKey,
  options?: Omit<
    UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
    "queryKey"
  >,
): UseQueryReturnType<TData, TError>;
export default function useDependentQuery<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  deps: Deps,
  queryKey: QueryKey,
  queryFn: QueryFunction<TQueryFnData>,
  options?: Omit<
    UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
    "queryKey" | "queryFn"
  >,
): UseQueryReturnType<TData, TError>;

export default function useDependentQuery<
  TQueryFnData,
  TError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  deps: Deps,
  arg1: TQueryKey | UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
  arg2?:
    | QueryFunction<TQueryFnData, TQueryKey>
    | UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
  arg3?: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
): UseQueryReturnType<TData, TError> {
  const parsedOptions = parseQueryArgs(arg1, arg2, arg3) as UseQueryOptions<
    TQueryFnData,
    TError,
    TData,
    TQueryKey
  >;

  const baseUseQuery = useQuery({
    ...parsedOptions,
    enabled: computed(
      () =>
        (unref(parsedOptions.enabled) ?? true) &&
        deps.every((x) => (isRef(x) ? unref(x) : unref(x.isSuccess))),
    ),
  });

  const isLoading = computed(
    () =>
      unref(baseUseQuery.isLoading) ||
      deps.some((x) => (isRef(x) ? !unref(x) : unref(x.isLoading))),
  );

  const isError = computed(
    () =>
      unref(baseUseQuery.isError) ||
      deps.some((x) => (isRef(x) ? false : unref(x.isError))),
  );

  const status = computed(() => {
    if (unref(baseUseQuery.status) !== "idle") {
      return unref(baseUseQuery.status);
    }

    if (unref(isError)) {
      return "idle";
    }

    if (unref(isLoading)) {
      return "loading";
    }

    return unref(baseUseQuery.status);
  });

  // @ts-expect-error isLoading type inference
  return {
    ...baseUseQuery,
    status,
    isLoading,
    isError,
  };
}
