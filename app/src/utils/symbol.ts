export function symbolWithoutPrefix(symbol: string) {
  return symbol.toLowerCase().replace(/^(c|e|u)/, "");
}

export function isLikeSymbol(symbol1: string, symbol2: string) {
  symbol1 = symbol1.toLowerCase();
  symbol2 = symbol2.toLowerCase();
  return (
    symbol1 === symbol2 ||
    symbolWithoutPrefix(symbol1) === symbol2 ||
    symbol1 === symbolWithoutPrefix(symbol2) ||
    symbolWithoutPrefix(symbol1) === symbolWithoutPrefix(symbol2)
  );
}
