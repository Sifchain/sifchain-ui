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
import AssetIcon, { IconName } from "@/components/AssetIcon";
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
import { Asset, Network } from "@sifchain/sdk";
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
    const isNoBalanceRef = computed(
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
          replace: false,
          to: getImportLocation("select", {
            symbol: props.tokenItem.asset.symbol,
            network: props.tokenItem.asset.homeNetwork,
          }),
        },
      },
      isNoBalanceRef.value
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
              replace: false,
              to: getExportLocation("setup", {
                symbol: props.tokenItem.asset.symbol,
                network: props.tokenItem.asset.homeNetwork,
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
            name: "AddLiquidity",
            params: {
              externalAsset:
                props.tokenItem.asset.symbol === "rowan"
                  ? ""
                  : props.tokenItem.asset.symbol,
            },
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
          "list-complete-item align-middle h-8 border-dashed border-b border-white border-opacity-40 relative overflow-hidden last:border-transparent group",
          showMaskRef.value && "opacity-40",
        )}
      >
        <td class="text-left align-middle w-[120px] group-hover:opacity-80">
          <div class="flex items-center">
            <TokenIcon asset={assetRef}></TokenIcon>
            {/* <img class="w-4 h-4" src={iconUrlRef.value} /> */}
            <span class="ml-1 uppercase">
              {getAssetLabel(props.tokenItem.asset)}
            </span>
          </div>
        </td>
        <td class="text-right align-middle min-w-[200px]">
          <div class="inline-flex items-center relative">
            <span class="group-hover:opacity-80">
              {isNoBalanceRef.value
                ? props.tokenItem.importTxs.length
                  ? "..."
                  : null
                : formatAssetAmount(props.tokenItem.amount)}
            </span>

            {props.tokenItem.importTxs.length > 0 && (
              <Tooltip
                arrow
                interactive
                placement="top"
                appendTo={() =>
                  document.querySelector("#portal-target") as Element
                }
                offset={[112, 20]}
                content={
                  <div class="text-left w-[250px]">
                    <p class="mb-1">
                      You have the following pending import transactions. The
                      imported tokens will usually be available for use on
                      Sifchain within 20 minutes, sometimes upwards of 60
                      minutes.
                    </p>
                    <ul class="list-disc list-inside">
                      {props.tokenItem.importTxs.map(({ tx, network }) => (
                        <li>
                          <a
                            class="font-normal text-accent-base hover:text-underline"
                            href={getBlockExplorerUrl(
                              config.sifChainId,
                              tx.hash,
                              network,
                            )}
                            title={tx.hash}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <span class="capitalize">{network}</span> Import{" "}
                            {shortenHash(tx.hash)}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                }
              >
                <div class="absolute top-50% left-[100%] translate-y-[-50%]">
                  <ProgressRing size={28} ringWidth={4} progress={50} />
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
                <div style={{ transform: "rotate(-90deg)" }}>
                  <AssetIcon
                    active
                    icon="interactive/chevron-down"
                    class="w-[22px] h-[22px] animation-fade-in"
                  />
                </div>
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
