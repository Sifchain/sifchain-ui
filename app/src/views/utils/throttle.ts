export function throttle<F extends (...args: any[]) => void>(
  func: F,
  ms: number,
): (...args: Parameters<F>) => void {
  let lastCall = 0;
  return (...args: Parameters<F>) => {
    const now = Date.now();
    if (now - lastCall >= ms) {
      lastCall = now;
      func(...args);
    }
  };
}
