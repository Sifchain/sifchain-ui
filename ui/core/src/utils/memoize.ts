export function memoize<
  F extends (this: any, ...args: any[]) => any,
  R extends (...args: Parameters<F>) => any
>(func: F, resolver?: R) {
  if (
    typeof func != "function" ||
    (resolver != null && typeof resolver != "function")
  ) {
    throw new TypeError("Invalid memo");
  }
  let memoized = (...args: Parameters<F>) => {
    const cache = new Map<any, ReturnType<F>>();
    let fn = (...args: Parameters<F>) => {
      const key = resolver ? resolver(...args) : args[0];
      if (cache?.has(key)) {
        return cache.get(key);
      }
      const result = func(...args);
      cache?.set(key, result);
      return result;
    };
    memoized = fn;
    return fn(...args);
  };
  return memoized as F;
}
