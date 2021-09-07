import { useCore } from "@/hooks/useCore";
import { Asset } from "@sifchain/sdk";

// Load all SVG icons with glob so that they get included as assets
// This will just give us their src string.
// Our SVG loader has a rule: when it comes to items from /public, do not inline them. only return src.
const globResult = import.meta.globEager("./../../public/images/tokens/*");

const tokenSrcMap = Object.keys(globResult).reduce((map, key) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const symbol = key
    .split("/")
    .pop()
    .replace(/\.svg$/i, "");
  map.set(symbol, globResult[key].default);
  return map;
}, new Map<string, string>());

export const getTokenIconUrl = (
  asset: Asset,
  baseUrl = "",
): string | undefined => {
  const core = useCore();
  let svgUrl = tokenSrcMap.get(asset.displaySymbol.toUpperCase());
  if (svgUrl) {
    svgUrl = baseUrl + svgUrl;
  }
  return (
    svgUrl ||
    core.config.assets
      .find((a) => a.symbol == asset?.symbol)
      ?.imageUrl?.replace("thumb", "large")
  );
};
