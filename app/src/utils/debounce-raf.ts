export default function debounce(fn: (...args: any[]) => void) {
  let queued = 0;

  return (...args: any[]) => {
    if (queued) {
      window.cancelAnimationFrame(queued);
    }

    queued = window.requestAnimationFrame(fn.bind(fn, ...args));
  };
}
