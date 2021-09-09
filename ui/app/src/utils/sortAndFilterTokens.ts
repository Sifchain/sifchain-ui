import { formatAssetAmount } from "@/componentsLegacy/shared/utils";
import { useChainsList } from "@/hooks/useChains";
import { TokenListItem } from "@/hooks/useToken";
import { Network } from "@sifchain/sdk";

export type TokenSortBy = "balance" | "symbol";

export function sortAndFilterTokens(props: {
  tokens: TokenListItem[];
  searchQuery?: string;
  sortBy?: TokenSortBy;
  reverse?: boolean;
  network?: Network;
}) {
  props.network = props.network || Network.SIFCHAIN;
  props.sortBy = props.sortBy || "symbol";
  props.searchQuery = props.searchQuery || "";

  const promotedTokensByRank: Record<string, number> = {};
  useChainsList().forEach((chain) => {
    if (props.network === chain.network) {
      promotedTokensByRank[chain.nativeAsset.symbol] = 0;
    }
  });

  const getTokenPendingImportTotal = (token: TokenListItem) => {
    let total = 0;
    token.pendingImports.forEach((data) => {
      total += parseFloat(data.interchainTx.assetAmount.amount.toString());
    });
    return total;
  };

  const array = props.tokens
    .filter((token) => {
      if (token.asset.network !== props.network) {
        return false;
      }
      if (!props.searchQuery) return true;
      return (
        token.asset.displaySymbol
          .toLowerCase()
          .indexOf(props.searchQuery.toLowerCase()) !== -1 ||
        token.asset.label
          .toLowerCase()
          .indexOf(props.searchQuery.toLowerCase()) !== -1
      );
    })
    .sort((a: TokenListItem, b: TokenListItem) => {
      if (props.sortBy === "balance") {
        // Balance: descending
        return (
          parseFloat(formatAssetAmount(b.amount)) -
          parseFloat(formatAssetAmount(a.amount))
        );
      } else {
        // Sort by: Name, then balance, then rank
        const [aRank, bRank] = [
          promotedTokensByRank[a.asset.symbol.toLowerCase()] ?? Infinity,
          promotedTokensByRank[b.asset.symbol.toLowerCase()] ?? Infinity,
        ];

        if (aRank !== Infinity || bRank !== Infinity) {
          return aRank < bRank ? -1 : bRank < aRank ? 1 : 0;
        }
        const aAmountParsed =
          +a.amount.amount.toString() + getTokenPendingImportTotal(a);
        const bAmountParsed =
          +b.amount.amount.toString() + getTokenPendingImportTotal(b);
        if (aAmountParsed !== bAmountParsed) {
          return !!aAmountParsed > !!bAmountParsed ? -1 : 1;
        }

        return a.asset.displaySymbol.localeCompare(b.asset.displaySymbol);
      }
    });

  if (props.reverse) array.reverse();

  return array;
}
