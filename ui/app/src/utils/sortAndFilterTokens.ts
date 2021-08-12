import { formatAssetAmount } from "@/componentsLegacy/shared/utils";
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

  const promotedTokensByRank = [
    props.network === Network.SIFCHAIN && "rowan",
    props.network === Network.ETHEREUM && "eth",
    props.network === Network.COSMOSHUB && "uphoton",
  ].reduce((prev, curr, currIndex) => {
    if (!curr) return prev;
    prev[curr] = currIndex;
    return prev;
  }, {} as { [key: string]: number });

  const array = props.tokens
    .filter((token) => {
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
          promotedTokensByRank[a.asset.displaySymbol.toLowerCase()] ?? Infinity,
          promotedTokensByRank[b.asset.displaySymbol.toLowerCase()] ?? Infinity,
        ];
        if (aRank !== Infinity || bRank !== Infinity) {
          return aRank < bRank ? -1 : bRank < aRank ? 1 : 0;
        }
        const aAmountParsed = +a.amount.amount.toString();
        const bAmountParsed = +b.amount.amount.toString();
        if (aAmountParsed !== bAmountParsed) {
          return !!aAmountParsed > !!bAmountParsed ? -1 : 1;
        }
        return a.asset.displaySymbol.localeCompare(b.asset.displaySymbol);
      }
    });

  if (props.reverse) array.reverse();

  return array;
}
