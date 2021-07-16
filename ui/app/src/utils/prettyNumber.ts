export function prettyNumber(n: number, precision: number = 2) {
  return n
    .toFixed(precision)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
