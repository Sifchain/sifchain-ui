import { defineComponent, PropType, computed, BaseTransition } from "vue";
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
import { Button } from "@/components/Button/Button";

export const SYMBOL_COLUMN_WIDTH = 130;

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
        visible: true,
        props: {
          replace: true,
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
            visible: expandedRef.value,
            props: { disabled: true, class: !expandedRef.value && "invisible" },
          }
        : {
            tag: RouterLink,
            icon: "interactive/arrow-up",
            name: "Export",
            visible: expandedRef.value,
            props: {
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
        visible: expandedRef.value,
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
        visible: expandedRef.value,
        props: {
          to: {
            name: "Swap",
            query: { fromSymbol: props.tokenItem.asset.symbol },
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
        <td class="text-left align-middle w-[140px]">
          <div class="flex items-center">
            <TokenIcon asset={assetRef}></TokenIcon>
            {/* <img class="w-4 h-4" src={iconUrlRef.value} /> */}
            <span class="ml-1 uppercase">
              {getAssetLabel(props.tokenItem.asset)}
            </span>
          </div>
        </td>
        <td class="text-right align-middle min-w-[200px]">
          <div class="inline-flex items-center">
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
        <td class="text-right align-middle w-[380px]">
          <div class="inline-flex items-center">
            {buttonsRef.value
              .filter((definition) => definition.visible)
              .map((definition) => {
                return (
                  <Button.Inline
                    key={definition.name}
                    class="mr-1 animation-fade-in"
                    icon={definition.icon as IconName}
                    {...definition.props}
                  >
                    {definition.name}
                  </Button.Inline>
                );
              })}
            <button
              key={"expanded-" + expandedRef.value}
              class={cx(
                "order-last w-5 h-5 items-center justify-center cursor-pointer rounded-full transition-all",
                !expandedRef.value && "bg-transparent",
                expandedRef.value && "bg-gray-base",
              )}
              onClick={() => {
                props.onSetExpandedSymbol(
                  expandedRef.value ? "" : props.tokenItem.asset.symbol,
                );
              }}
            >
              {expandedRef.value ? (
                <AssetIcon
                  active
                  icon="interactive/chevron-down"
                  style={{ transform: "rotate(-90deg)" }}
                  class="w-[26px] h-[26px] animation-fade-in"
                />
              ) : (
                <AssetIcon
                  active
                  icon="interactive/ellipsis"
                  class="w-[26px] h-[26px] fill-current text-accent-base animation-fade-in"
                />
              )}
            </button>
          </div>
        </td>
      </tr>
    );
  },
});
