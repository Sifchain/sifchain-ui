import { TokenListItem } from "@/hooks/useToken";

export type TokenSortBy = "balance" | "symbol";

const goldList = ["rowan", "photon"];
export function sortAndFilterTokens(props: {
  tokens: TokenListItem[];
  searchQuery?: string;
  sortBy?: TokenSortBy;
  reverse?: boolean;
}) {
  props.sortBy = props.sortBy || "symbol";
  props.searchQuery = props.searchQuery || "";

  const rowanRegex = /^.?rowan/i;

  const array = props.tokens
    .filter((token) => {
      if (!props.searchQuery) return true;
      return (
        (token.asset.displaySymbol || token.asset.symbol)
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
          (parseFloat(b.amount.amount.toString()) || 0) -
          (parseFloat(a.amount.amount.toString()) || 0)
        );
      } else {
        // Name: ascending, rowan first.
        if (rowanRegex.test(a.asset.symbol)) return -1;
        if (rowanRegex.test(b.asset.symbol)) return 1;
        return a.asset.symbol.localeCompare(b.asset.symbol);
      }
    });

  if (props.reverse) array.reverse();

  return array;
}
