import { defineComponent, PropType, computed } from "vue";
import cx from "clsx";
import { ref, toRefs } from "@vue/reactivity";
import { RouterLink } from "vue-router";
import { useBalancePageData } from "./useBalancePageData";
import { TokenListItem } from "@/hooks/useToken";
import {
  formatAssetAmount,
  getPeggedSymbol,
} from "@/componentsLegacy/shared/utils";
import ProgressRing from "@/components/ProgressRing";
import AssetIcon, { IconName } from "@/componentsLegacy/utilities/AssetIcon";
import Tooltip from "@/components/Tooltip";
import {
  getBlockExplorerUrl,
  shortenHash,
} from "@/componentsLegacy/shared/utils";
import { useTokenIconUrl } from "@/hooks/useTokenIconUrl";
import {
  getAssetLabel,
  getUnpeggedSymbol,
} from "@/componentsLegacy/shared/utils";
import { getImportLocation } from "./Import/useImportData";
import { TokenIcon } from "@/components/TokenIcon";
import { getExportLocation } from "./Export/useExportData";
import { useCore } from "@/hooks/useCore";
import { Network } from "@sifchain/sdk";

export type BalanceRowActionType = "import" | "export" | "pool" | "swap";

export default defineComponent({
  name: "BalanceRow",
  props: {
    tokenItem: {
      type: Object as PropType<TokenListItem>,
      required: true,
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
    const { config } = useCore();

    const expandedRef = computed(
      () => props.expandedSymbol === props.tokenItem.asset.symbol,
    );
    const showMaskRef = computed(
      () => props.expandedSymbol && !expandedRef.value,
    );
    const emptyRef = computed(
      () => props.tokenItem.amount.amount.toString(false) === "0",
    );
    const assetRef = computed(() => props.tokenItem.asset);

    // Always render all buttons, expandedRef.value or not, they will just be hidden.
    const buttonsRef = computed(() => [
      {
        tag: RouterLink,
        icon: "interactive/arrow-down",
        name: "Import",
        props: {
          replace: true,
          class: !expandedRef.value && "order-10", // Put import button last if not expanded
          to: getImportLocation("select", {
            symbol: getUnpeggedSymbol(
              props.tokenItem.asset.symbol,
            ).toLowerCase(),
          }),
        },
      },
      emptyRef.value
        ? {
            tag: "button",
            icon: "interactive/arrow-up",
            name: "Export",
            props: { disabled: true, class: !expandedRef.value && "invisible" },
          }
        : {
            tag: RouterLink,
            icon: "interactive/arrow-up",
            name: "Export",
            props: {
              class: !expandedRef.value && "invisible",
              replace: true,
              to: getExportLocation("select", {
                symbol: props.tokenItem.asset.symbol,
                network: Network.ETHEREUM,
              }),
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
        onClick={(e) => {
          if (showMaskRef.value) {
            props.onSetExpandedSymbol("");
          }
        }}
        class={cx(
          "align-middle h-8 border-dashed border-b border-white border-opacity-40 relative overflow-hidden last:border-transparent",
          showMaskRef.value && "opacity-40",
        )}
      >
        <td class="text-left align-middle min-w-[130px]">
          <div class="flex items-center">
            <TokenIcon asset={assetRef}></TokenIcon>
            {/* <img class="w-4 h-4" src={iconUrlRef.value} /> */}
            <span class="ml-1 uppercase">
              {getAssetLabel(props.tokenItem.asset)}
            </span>
          </div>
        </td>
        <td class="text-right align-middle min-w-[200px]">
          <div class="flex items-center">
            {emptyRef.value ? null : formatAssetAmount(props.tokenItem.amount)}

            {props.tokenItem.pegTxs.length > 0 && (
              <Tooltip
                arrow
                interactive
                content={
                  <div class="text-left">
                    <p class="mb-1">
                      You have the following pending transactions:
                    </p>
                    <ul class="list-disc list-inside">
                      {props.tokenItem.pegTxs.map((tx) => (
                        <li>
                          <a
                            class="font-normal text-accent-base hover:text-underline"
                            href={getBlockExplorerUrl(
                              config.sifChainId,
                              tx.hash,
                            )}
                            title={tx.hash}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {shortenHash(tx.hash)}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                }
              >
                <div>
                  <ProgressRing
                    class="ml-1"
                    size={28}
                    ringWidth={4}
                    progress={50}
                  />
                </div>
              </Tooltip>
            )}
          </div>
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
