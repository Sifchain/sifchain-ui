import { UseQueryReturnType } from "vue-query";

export type UseQueryDataType<T extends (...args: any) => any> =
  ReturnType<T> extends UseQueryReturnType<infer TData, infer _> ? TData : T;

export type ElementOf<T> = T extends (infer U)[] ? U : never;
