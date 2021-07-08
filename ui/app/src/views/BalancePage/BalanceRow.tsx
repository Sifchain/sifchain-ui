import { TokenListItem } from "./useBalancePageData";
import { ref } from "@vue/reactivity";
import { useTokenIconUrl } from "@/hooks/useTokenIconUrl";

export default function BalanceRow(props: { tokenItem: TokenListItem }) {
  const iconUrlRef = useTokenIconUrl({
    symbol: ref(props.tokenItem.asset.symbol),
  });

  return (
    <tr class="align-middle h-[52px]">
      <td class="text-left align-middle">
        <div class="flex items-center">
          <img class="w-4 h-4" src={iconUrlRef.value} />
          <span class="ml-1 uppercase">{props.tokenItem.asset.symbol}</span>
        </div>
      </td>
      <td class="text-right align-middle">
        {props.tokenItem.amount.amount.toString(false) === "0"
          ? null
          : props.tokenItem.amount.amount.toString(false)}
      </td>
    </tr>
  );
}
