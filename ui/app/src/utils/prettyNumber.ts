export function prettyNumber(n: number, precision: number = 2) {
  // 123456789.123456789 => "123,456,789.12"
  const [main, fraction] = n.toFixed(precision).split(".");

  let final = main.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  if (fraction) final += "." + fraction;
  return final;
}
