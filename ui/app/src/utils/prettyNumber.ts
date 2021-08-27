export function prettyNumber(n: number, precision = 2) {
  // 123456789.123456789 => "123,456,789.12"
  // const [main, fraction] = n.toFixed(precision).split(".");
  return new Intl.NumberFormat("en-us", {
    maximumFractionDigits: precision,
  }).format(n);
  // let final = main.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  // if (fraction) final += "." + fraction;
  // return final;
}
