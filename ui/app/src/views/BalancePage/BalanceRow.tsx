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

import { prettyNumber } from "@/utils/prettyNumber";
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
          disabled: props.tokenItem.asset.decommissioned,
          replace: false,
          to: getImportLocation("select", {
            symbol: props.tokenItem.asset.symbol,
            network:
              props.tokenItem.asset.homeNetwork === Network.SIFCHAIN
                ? Network.ETHEREUM
                : props.tokenItem.asset.homeNetwork,
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
                network:
                  props.tokenItem.asset.homeNetwork === Network.SIFCHAIN
                    ? Network.ETHEREUM
                    : props.tokenItem.asset.homeNetwork,
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
          disabled: props.tokenItem.asset.decommissioned,
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
          disabled: props.tokenItem.asset.decommissioned,
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
            {props.tokenItem.asset.decommissioned &&
              props.tokenItem.asset.decommissionReason && (
                <Button.InlineHelp>
                  {props.tokenItem.asset.decommissionReason}
                </Button.InlineHelp>
              )}
          </div>
        </td>
        <td class="text-right align-middle min-w-[160px]">
          <div class="inline-flex items-center relative">
            <span class="group-hover:opacity-80 group-hover:delay-75">
              {isNoBalanceRef.value
                ? props.tokenItem.pendingImports.length ||
                  props.tokenItem.pendingExports.length
                  ? "..."
                  : null
                : formatAssetAmount(props.tokenItem.amount)}
            </span>

            <div
              class="absolute top-50% left-[100%] ml-[4px] flex items-center"
              key={JSON.stringify(props.tokenItem.pendingImports)}
            >
              {props.tokenItem.pendingImports.length > 0 && (
                <Tooltip
                  arrow
                  interactive
                  placement="top"
                  appendTo={() =>
                    document.querySelector("#portal-target") as Element
                  }
                  maxWidth={"none"}
                  content={
                    <div class="text-left w-[450px]">
                      <p class="mb-1">
                        You have the following pending import transactions.
                        {props.tokenItem.pendingImports.some(
                          (item) => item.bridgeTx.type === "eth",
                        ) && (
                          <>
                            <br />
                            Imports from Ethereum will be available after 50
                            block confirmations.
                          </>
                        )}
                        {props.tokenItem.pendingImports.some(
                          (item) => item.bridgeTx.type === "ibc",
                        ) && (
                          <>
                            <br />
                            IBC imports will be usually be available within 5
                            minutes, sometimes upwards of 45 minutes.
                          </>
                        )}
                      </p>
                      <ul class="list-disc list-inside">
                        {props.tokenItem.pendingImports.map(({ bridgeTx }) => (
                          <li>
                            Import {formatAssetAmount(bridgeTx.assetAmount)}{" "}
                            {bridgeTx.assetAmount.displaySymbol.toUpperCase()}{" "}
                            from {bridgeTx.fromChain.displayName}
                            {bridgeTx.type === "eth" &&
                              ` (${bridgeTx.confirmCount} / ${bridgeTx.completionConfirmCount})`}{" "}
                            (
                            <a
                              class="font-normal text-accent-base hover:text-underline"
                              href={bridgeTx.fromChain.getBlockExplorerUrlForTxHash(
                                bridgeTx.hash,
                              )}
                              title={bridgeTx.hash}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {shortenHash(bridgeTx.hash)}
                            </a>
                            )
                          </li>
                        ))}
                      </ul>
                    </div>
                  }
                >
                  <div>
                    <AssetIcon
                      size={20}
                      icon="interactive/arrow-down"
                      class="text-gray-800 animate-pulse-slow"
                    />
                  </div>
                </Tooltip>
              )}
              {props.tokenItem.pendingExports.length > 0 && (
                <Tooltip
                  arrow
                  interactive
                  key={JSON.stringify(props.tokenItem.pendingExports)}
                  placement="top"
                  appendTo={() =>
                    document.querySelector("#portal-target") as Element
                  }
                  maxWidth={"none"}
                  content={
                    <div class="text-left w-[400px]">
                      <p class="mb-1">
                        You have the following pending export transactions. The
                        exported tokens will usually be available for use on
                        their target chain within 10 minutes, sometimes upwards
                        of 60 minutes.
                      </p>
                      <ul class="list-disc list-inside">
                        {props.tokenItem.pendingExports.map(({ bridgeTx }) => (
                          <li>
                            Export {formatAssetAmount(bridgeTx.assetAmount)}{" "}
                            {bridgeTx.assetAmount.displaySymbol.toUpperCase()}{" "}
                            to {bridgeTx.toChain.displayName} (
                            <a
                              class="font-normal text-accent-base hover:text-underline"
                              href={bridgeTx.fromChain.getBlockExplorerUrlForTxHash(
                                bridgeTx.hash,
                              )}
                              title={bridgeTx.hash}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {shortenHash(bridgeTx.hash)}
                            </a>
                            )
                          </li>
                        ))}
                      </ul>
                    </div>
                  }
                >
                  <div>
                    <AssetIcon
                      size={20}
                      icon="interactive/arrow-up"
                      class="text-gray-800 animate-pulse-slow"
                    />
                  </div>
                </Tooltip>
              )}
            </div>
          </div>
        </td>
        <td class="text-right align-middle w-[420px]">
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
