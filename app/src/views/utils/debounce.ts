export function debounce<F extends (...args: any[]) => void>(
  func: F,
  ms: number,
  immediate?: boolean,
): (...args: Parameters<F>) => void {
  let timeout = setTimeout(() => {}, 0);
  return (...args: Parameters<F>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func(...args);
    }, ms);
  };
}
