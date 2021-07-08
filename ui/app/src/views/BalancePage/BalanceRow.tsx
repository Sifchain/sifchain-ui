import { TokenListItem } from "./useBalancePageData";
import cx from "clsx";
import { ref } from "@vue/reactivity";
import AssetIconVue, {
  IconName,
} from "@/componentsLegacy/utilities/AssetIcon.vue";
import { useTokenIconUrl } from "@/hooks/useTokenIconUrl";

export type BalanceRowActionType = "import" | "export" | "pool" | "swap";

export default function BalanceRow(props: {
  tokenItem: TokenListItem;
  onAction: (type: BalanceRowActionType) => void;
  onSetExpandedSymbol: (symbol: string) => void;
  last: Boolean;
  expandedSymbol: string;
}) {
  const iconUrlRef = useTokenIconUrl({
    symbol: ref(props.tokenItem.asset.symbol),
  });

  const expanded = props.expandedSymbol === props.tokenItem.asset.symbol;
  const showMask = props.expandedSymbol && !expanded;
  const empty = props.tokenItem.amount.amount.toString(false) === "0";

  // Always render all buttons, expanded or not, they will just be hidden.
  const buttons = [
    {
      icon: "interactive/arrow-down",
      name: "Import",
      id: "import",
      class: !expanded && "order-10", // Put import button last if not expanded
    },
    {
      icon: "interactive/arrow-up",
      name: "Export",
      id: "export",
      disabled: empty,
      class: !expanded && "invisible",
    },
    {
      icon: "navigation/pool",
      name: "Pool",
      id: "pool",
      class: !expanded && "invisible",
    },
    {
      icon: "navigation/swap",
      name: "Swap",
      id: "swap",
      class: !expanded && "invisible",
    },
  ];

  return (
    <tr
      class={cx(
        "align-middle h-8 border-dashed border-b border-white border-opacity-40 relative overflow-hidden",
        props.last && "border-transparent",
      )}
    >
      <td class="text-left align-middle min-w-[130px]">
        {showMask && (
          <div
            class="bg-black opacity-60 absolute inset-0"
            onClick={() => props.onSetExpandedSymbol("")}
          />
        )}
        <div class="flex items-center">
          <img class="w-4 h-4" src={iconUrlRef.value} />
          <span class="ml-1 uppercase">{props.tokenItem.asset.symbol}</span>
        </div>
      </td>
      <td class="text-right align-middle min-w-[200px]">
        {empty ? null : props.tokenItem.amount.amount.toString(false)}
      </td>
      <td class="text-right align-middle">
        <div class="inline-flex items-center">
          {buttons.map((definition) => (
            <button
              class={cx(
                "mr-1 rounded inline-flex items-center py-[6px] px-1 text-accent-base text-xs font-semibold bg-darkfill-base",
                definition.disabled &&
                  "text-darkfill-disabled cursor-not-allowed",
                definition.class,
              )}
              onClick={() =>
                props.onAction(definition.id as BalanceRowActionType)
              }
            >
              <AssetIconVue
                active={!definition.disabled}
                disabled={definition.disabled}
                icon={definition.icon as IconName}
                class="w-4 h-4 mr-[2px] text-accent-base"
              />
              {definition.name}
            </button>
          ))}
          <button
            class={cx(
              "order-last w-5 h-5 items-center justify-center cursor-pointer rounded-full",
              !expanded && "bg-transparent",
              expanded && "bg-darkfill-base",
            )}
            onClick={() =>
              props.onSetExpandedSymbol(
                expanded ? "" : props.tokenItem.asset.symbol,
              )
            }
          >
            <AssetIconVue
              active
              icon={
                expanded ? "interactive/chevron-down" : "interactive/ellipsis"
              }
              style={{
                transform: !expanded ? "" : "rotate(270deg)",
              }}
            />
          </button>
        </div>
      </td>
    </tr>
  );
}
