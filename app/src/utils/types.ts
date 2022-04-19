import { UseQueryReturnType } from "vue-query";

export type UseQueryDataType<T extends (...args: any) => any> =
  ReturnType<T> extends UseQueryReturnType<infer TData, infer _> ? TData : T;
