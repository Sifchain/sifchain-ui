export function prettyNumber(n: number, precision: number = 2) {
  // 123456789.123456789 => "123,456,789.12"
  return n
    .toFixed(precision)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
