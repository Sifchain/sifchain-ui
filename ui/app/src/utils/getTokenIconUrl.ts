import { useCore } from "@/hooks/useCore";
import { Asset } from "@sifchain/sdk";

// All token svg icons are passed in as a <symbol, path> lookup via vite.config.ts.
// We don't use import.meta.glob because it gives warnings about the public dir, where these are stored...
const tokenSrcMap = new Map<string, string>(
  // @ts-ignore
  Object.entries(TOKEN_SVG_PATH_LOOKUP),
);

export const getTokenIconUrl = (
  asset: Asset,
  baseUrl = "",
): string | undefined => {
  const core = useCore();
  let svgUrl = tokenSrcMap.get(
    asset.displaySymbol.toUpperCase().replace(/ \(ERC-20\)/, ""),
  );
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
