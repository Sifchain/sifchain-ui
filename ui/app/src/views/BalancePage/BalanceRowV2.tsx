import { defineComponent, PropType, computed, ref } from "vue";
import cx from "clsx";
import { RouterLink } from "vue-router";
import { TokenListItem } from "@/hooks/useToken";
import { formatAssetAmount } from "@/componentsLegacy/shared/utils";

import AssetIcon, { IconName } from "@/components/AssetIcon";
import Tooltip from "@/components/Tooltip";
import { shortenHash } from "@/componentsLegacy/shared/utils";
import { getAssetLabel } from "@/componentsLegacy/shared/utils";
import { getImportLocation } from "./Import/useImportData";
import { getExportLocation } from "./Export/useExportData";
import { Network } from "@sifchain/sdk";
import { Button } from "@/components/Button/Button";
import { useChains } from "@/hooks/useChains";
import { TokenNetworkIcon } from "@/components/TokenNetworkIcon/TokenNetworkIcon";

export default defineComponent({
  name: "BalanceRow",
  props: {
    tokenItem: {
      type: Object as PropType<TokenListItem>,
      required: true,
    },
    isExpanded: {
      type: Boolean,
    },
    isMasked: {
      type: Boolean,
    },
    onExpand: {
      type: Function as PropType<(symbol: string) => void>,
      required: true,
    },
  },
  setup(props) {
    const hasNoBalance = computed(
      () => props.tokenItem.amount.amount.toString(false) === "0",
    );

    const { chainConfig, displayName } = useChains().get(
      props.tokenItem.asset.network,
    );

    // Always render all buttons, expandedRef.value or not, they will just be hidden.
    const buttonsRef = computed(() => [
      {
        tag: RouterLink,
        icon: "interactive/arrow-down",
        name: "Import",
        visible: true,
        help: chainConfig.underMaintenance
          ? `${displayName} Connection Under Maintenance`
          : null,
        props: {
          disabled:
            props.tokenItem.asset.decommissioned ||
            chainConfig.underMaintenance,
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
      hasNoBalance.value
        ? {
            tag: "button",
            icon: "interactive/arrow-up",
            name: "Export",
            visible: true,
            props: { disabled: true, class: "" },
          }
        : {
            tag: RouterLink,
            icon: "interactive/arrow-up",
            name: "Export",
            visible: true,
            help: chainConfig.underMaintenance
              ? `${displayName} Connection Under Maintenance`
              : null,
            props: {
              disabled: useChains().get(props.tokenItem.asset.homeNetwork)
                .chainConfig.underMaintenance,
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
        visible: props.isExpanded,
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
        visible: props.isExpanded,
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
      <div
        onClick={() => {
          if (props.isMasked) {
            props.onExpand("");
          }
        }}
        class={cx(
          "list-complete-item flex items-center align-middle h-8 border-solid border-gray-200 border-b border-opacity-80 ",
          "last:border-transparent hover:opacity-80 relative overflow-hidden group",
          {
            "opacity-40": props.isMasked,
          },
        )}
      >
        {/* token info */}
        <div class="text-left align-middle group-hover:opacity-80 w-[200px]">
          <div class="flex items-center">
            <TokenNetworkIcon asset={ref(props.tokenItem.asset)} />
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
        </div>
        {/* balance */}
        <div class="text-right align-middle flex-1">
          <div class="inline-flex items-center relative">
            <span class="group-hover:opacity-80 group-hover:delay-75">
              {hasNoBalance.value
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
        </div>
        {/* controls */}
        <div class={["text-right align-middle flex-1 min-w-[360px]"]}>
          <div class="inline-flex items-center">
            {buttonsRef.value
              .filter((definition) => definition.visible)
              .map((definition) => {
                const button = (
                  <Button.Inline
                    key={definition.name}
                    class="mr-1 animation-fade-in"
                    icon={definition.icon as IconName}
                    {...definition.props}
                  >
                    {definition.name}
                  </Button.Inline>
                );
                if (!definition.help) return button;
                return (
                  <Tooltip key={definition.name} content={definition.help}>
                    {button}
                  </Tooltip>
                );
              })}
            <button
              key={"expanded-" + props.isExpanded}
              class={cx(
                "order-last w-5 h-5 items-center justify-center cursor-pointer rounded-full transition-all",
                !props.isExpanded && "bg-transparent",
                props.isExpanded && "bg-gray-base",
              )}
              onClick={() => {
                props.onExpand(
                  props.isExpanded ? "" : props.tokenItem.asset.symbol,
                );
              }}
            >
              {props.isExpanded ? (
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
        </div>
      </div>
    );
  },
});
