import { useCore } from "~/hooks/useCore";
import { IAsset } from "@sifchain/sdk";

// All token svg icons are passed in as a <symbol, path> lookup via vite.config.ts.
// We don't use import.meta.glob because it gives warnings about the public dir, where these are stored...
const tokenSrcMap = new Map<string, string>(
  Object.entries(
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore injected by vite
    TOKEN_SVG_PATH_LOOKUP ?? {},
  ),
);

export const getTokenIconUrl = (
  asset: IAsset,
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
