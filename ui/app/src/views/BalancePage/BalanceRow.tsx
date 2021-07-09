import { defineComponent, PropType, computed } from "vue";
import cx from "clsx";
import { ref } from "@vue/reactivity";
import { RouterLink } from "vue-router";
import { useBalancePageData } from "./useBalancePageData";
import { TokenListItem } from "@/hooks/useTokenList";
import AssetIcon, { IconName } from "@/componentsLegacy/utilities/AssetIcon";
import { useTokenIconUrl } from "@/hooks/useTokenIconUrl";

export type BalanceRowActionType = "import" | "export" | "pool" | "swap";

export default defineComponent({
  name: "BalanceRow",
  props: {
    tokenItem: {
      type: Object as PropType<TokenListItem>,
      required: true,
    },
    last: {
      type: Boolean,
    },
    expandedSymbol: {
      type: String,
    },
    onSetExpandedSymbol: {
      type: Function as PropType<(symbol: string) => void>,
      required: true,
    },
  },
  setup(props) {
    const iconUrlRef = computed(
      () =>
        useTokenIconUrl({
          symbol: ref(props.tokenItem.asset.symbol),
        })?.value,
    );

    const expandedRef = computed(
      () => props.expandedSymbol === props.tokenItem.asset.symbol,
    );
    const showMaskRef = computed(
      () => props.expandedSymbol && !expandedRef.value,
    );
    const emptyRef = computed(
      () => props.tokenItem.amount.amount.toString(false) === "0",
    );

    // Always render all buttons, expandedRef.value or not, they will just be hidden.
    const buttonsRef = computed(() => [
      {
        tag: RouterLink,
        icon: "interactive/arrow-down",
        name: "Import",
        props: {
          to: {
            name: "Import",
            query: { symbol: props.tokenItem.asset.symbol },
          },
          class: !expandedRef.value && "order-10", // Put import button last if not expanded
        },
      },
      {
        tag: "button",
        icon: "interactive/arrow-up",
        name: "Export",
        props: {
          disabled: emptyRef.value,
          class: !expandedRef.value && "invisible",
        },
      },
      {
        icon: "navigation/pool",
        name: "Pool",
        id: "pool",
        class: !expandedRef.value && "invisible",
        tag: RouterLink,
        props: {
          to: {
            path: "pool",
          },
        },
      },
      {
        icon: "navigation/swap",
        name: "Swap",
        id: "swap",
        tag: RouterLink,
        props: {
          class: !expandedRef.value && "invisible",
          to: {
            path: "swap",
            query: { to: props.tokenItem.asset.symbol },
          },
        },
      },
    ]);

    return () => (
      <tr
        class={cx(
          "align-middle h-8 border-dashed border-b border-white border-opacity-40 relative overflow-hidden",
          props.last && "border-transparent",
          showMaskRef.value && "opacity-40",
        )}
      >
        <td class="text-left align-middle min-w-[130px]">
          <div class="flex items-center">
            <img class="w-4 h-4" src={iconUrlRef.value} />
            <span class="ml-1 uppercase">{props.tokenItem.asset.symbol}</span>
          </div>
        </td>
        <td class="text-right align-middle min-w-[200px]">
          {emptyRef.value
            ? null
            : props.tokenItem.amount.amount.toString(false)}
        </td>
        <td class="text-right align-middle">
          <div class="inline-flex items-center">
            {buttonsRef.value.map((definition) => {
              const Cmp: any = definition.tag;
              return (
                <Cmp
                  class={cx(
                    "mr-1 rounded inline-flex items-center py-[6px] px-1 text-accent-base text-xs font-semibold bg-gray-base",
                    definition.props.disabled &&
                      "text-gray-disabled cursor-not-allowed",
                    definition.class,
                  )}
                  {...definition.props}
                >
                  <AssetIcon
                    active={!definition.props.disabled}
                    disabled={definition.props.disabled}
                    icon={definition.icon as IconName}
                    class="w-4 h-4 mr-[2px] text-accent-base"
                  />
                  {definition.name}
                </Cmp>
              );
            })}
            <button
              class={cx(
                "order-last w-5 h-5 items-center justify-center cursor-pointer rounded-full",
                !expandedRef.value && "bg-transparent",
                expandedRef.value && "bg-gray-base",
              )}
              onClick={() => {
                props.onSetExpandedSymbol(
                  expandedRef.value ? "" : props.tokenItem.asset.symbol,
                );
              }}
            >
              <AssetIcon
                active
                icon={
                  expandedRef.value
                    ? "interactive/chevron-down"
                    : "interactive/ellipsis"
                }
                style={{
                  transform: !expandedRef.value ? "" : "rotate(270deg)",
                }}
              />
            </button>
          </div>
        </td>
      </tr>
    );
  },
});
