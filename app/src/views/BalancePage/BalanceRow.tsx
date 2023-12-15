import { Network } from "@sifchain/sdk";
import cx from "clsx";
import { computed, defineComponent, PropType, ref } from "vue";
import { RouterLink } from "vue-router";

import { formatAssetAmount } from "~/components/utils";
import { TokenListItem } from "~/hooks/useToken";
import AssetIcon, { IconName } from "~/components/AssetIcon";
import { Button } from "~/components/Button/Button";
import { TokenNetworkIcon } from "~/components/TokenNetworkIcon/TokenNetworkIcon";
import Tooltip from "~/components/Tooltip";
import { getAssetLabel, shortenHash } from "~/components/utils";
import { useChains } from "~/hooks/useChains";
import { flagsStore } from "~/store/modules/flags";
import { getExportLocation } from "./Export/useExportData";
import { getImportLocation } from "./Import/useImportData";

const ETH_MERGE_DISCLAIMER =
  "All imports/exports of ERC-20 tokens and ETH are currently unavailable.";
const ETH_BRIDGE_EXPORT_DISCLAIMER =
  "At the moment, exporting ERC-20 tokens and ETH is not possible. However, you can withdraw your funds by exchanging them for an IBC token and then exporting them through IBC.";

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

    const swapItem = computed(() => ({
      icon: "navigation/swap",
      name: "Swap",
      id: "swap",
      tag: RouterLink,
      visible: props.isExpanded,
      help: null,
      props: {
        disabled: props.tokenItem.asset.decommissioned,
        to: {
          name: "Swap",
          query: { fromSymbol: props.tokenItem.asset.symbol },
        },
      },
    }));

    const isEthBridgeDisabled = computed(
      () =>
        flagsStore.state.remoteFlags.DISABLE_ETH_BRIDGE &&
        (props.tokenItem.asset.homeNetwork === "ethereum" ||
          props.tokenItem.asset.homeNetwork === "sifchain"), // disable rowan imports
    );

    const isEthBridgeExportDisabled = computed(
      () =>
        flagsStore.state.remoteFlags.DISABLE_ETH_BRIDGE_EXPORT &&
        (props.tokenItem.asset.homeNetwork === "ethereum" ||
          props.tokenItem.asset.homeNetwork === "sifchain"), // disable rowan exports
    );

    const importItem = computed(() => ({
      tag: RouterLink,
      icon: "interactive/arrow-down",
      name: "Import",
      visible: true,
      help: chainConfig.underMaintenance
        ? `${displayName} Connection Under Maintenance`
        : isEthBridgeDisabled.value
        ? ETH_MERGE_DISCLAIMER
        : null,
      props: {
        disabled:
          props.tokenItem.asset.decommissioned ||
          chainConfig.underMaintenance ||
          isEthBridgeDisabled.value,
        replace: false,
        to: getImportLocation("select", {
          symbol: props.tokenItem.asset.symbol,
          network:
            props.tokenItem.asset.homeNetwork === Network.SIFCHAIN
              ? Network.ETHEREUM
              : props.tokenItem.asset.homeNetwork,
        }),
      },
    }));

    // Always render all buttons, expandedRef.value or not, they will just be hidden.
    const buttonsRef = computed(() =>
      props.tokenItem.asset.displaySymbol === "rowan" && !props.isExpanded
        ? [
            hasNoBalance.value
              ? importItem.value
              : {
                  tag: "a",
                  icon: "navigation/stake",
                  name: "Stake",
                  visible: true,
                  help: null,
                  props: {
                    href: "https://wallet.keplr.app/#/sifchain/stake",
                    target: "_blank",
                    rel: "noreferrer noopener",
                  },
                },
            {
              ...swapItem.value,
              visible: true,
            },
          ]
        : [
            importItem.value,
            hasNoBalance.value ||
            isEthBridgeDisabled.value ||
            isEthBridgeExportDisabled.value
              ? {
                  tag: "button",
                  icon: "interactive/arrow-up",
                  name: "Export",
                  visible: true,
                  help: isEthBridgeExportDisabled.value
                    ? ETH_BRIDGE_EXPORT_DISCLAIMER
                    : isEthBridgeDisabled.value
                    ? ETH_MERGE_DISCLAIMER
                    : null,
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
              tag: RouterLink,
              icon: "navigation/pool",
              name: "Pool",
              id: "pool",
              help: null,
              visible: props.isExpanded,
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
          ],
    );

    return () => (
      <div
        onClick={() => {
          if (props.isMasked) {
            props.onExpand?.("");
          }
        }}
        class={cx(
          "list-complete-item flex h-8 items-center border-b border-solid border-gray-200 border-opacity-80 align-middle",
          "group relative overflow-hidden last:border-transparent hover:opacity-80",
          {
            "opacity-40": props.isMasked,
          },
        )}
      >
        {/* token info */}
        <div class="w-[200px] text-left align-middle group-hover:opacity-80">
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
        <div class="flex-1 text-right align-middle">
          <div class="relative inline-flex items-center">
            <span class="group-hover:opacity-80 group-hover:delay-75">
              {hasNoBalance.value
                ? props.tokenItem.pendingImports.length ||
                  props.tokenItem.pendingExports.length
                  ? "..."
                  : null
                : formatAssetAmount(props.tokenItem.amount)}
            </span>
            <div
              class="top-50% absolute left-[100%] ml-[4px] flex items-center"
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
                    <div class="w-[450px] text-left">
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
                      <ul class="list-inside list-disc">
                        {props.tokenItem.pendingImports.map(({ bridgeTx }) => (
                          <li>
                            Import {formatAssetAmount(bridgeTx.assetAmount)}{" "}
                            {bridgeTx.assetAmount.displaySymbol.toUpperCase()}{" "}
                            from {bridgeTx.fromChain.displayName}
                            {bridgeTx.type === "eth" &&
                              ` (${bridgeTx.confirmCount} / ${bridgeTx.completionConfirmCount})`}{" "}
                            (
                            <a
                              class="text-accent-base hover:text-underline font-normal"
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
                      class="animate-pulse-slow text-gray-800"
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
                    <div class="w-[400px] text-left">
                      <p class="mb-1">
                        You have the following pending export transactions. The
                        exported tokens will usually be available for use on
                        their target chain within 10 minutes, sometimes upwards
                        of 60 minutes.
                      </p>
                      <ul class="list-inside list-disc">
                        {props.tokenItem.pendingExports.map(({ bridgeTx }) => (
                          <li>
                            Export {formatAssetAmount(bridgeTx.assetAmount)}{" "}
                            {bridgeTx.assetAmount.displaySymbol.toUpperCase()}{" "}
                            to {bridgeTx.toChain.displayName} (
                            <a
                              class="text-accent-base hover:text-underline font-normal"
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
                      class="animate-pulse-slow text-gray-800"
                    />
                  </div>
                </Tooltip>
              )}
            </div>
          </div>
        </div>
        <div class={["min-w-[360px] flex-1 text-right align-middle"]}>
          <div class="inline-flex items-center">
            {[...buttonsRef.value]
              .filter((btn) => btn.visible)
              .map((btn) => {
                const button = (
                  <Button.Inline
                    key={btn.name}
                    class="animation-fade-in mr-1"
                    icon={btn.icon as IconName}
                    {...btn.props}
                  >
                    {btn.name}
                  </Button.Inline>
                );
                if (!btn.help) return button;
                return (
                  <Tooltip key={btn.name} content={btn.help}>
                    {button}
                  </Tooltip>
                );
              })}
            <button
              key={"expanded-" + props.isExpanded}
              class={cx(
                "order-last h-5 w-5 cursor-pointer items-center justify-center rounded-full transition-all",
                !props.isExpanded && "bg-transparent",
                props.isExpanded && "bg-gray-base",
              )}
              onClick={() => {
                props.onExpand?.(
                  props.isExpanded ? "" : props.tokenItem.asset.symbol,
                );
              }}
            >
              {props.isExpanded ? (
                <div style={{ transform: "rotate(-90deg)" }}>
                  <AssetIcon
                    active
                    icon="interactive/chevron-down"
                    class="animation-fade-in h-[22px] w-[22px]"
                  />
                </div>
              ) : (
                <AssetIcon
                  active
                  icon="interactive/ellipsis"
                  class="text-accent-base animation-fade-in h-[26px] w-[26px] fill-current"
                />
              )}
            </button>
          </div>
        </div>
      </div>
    );
  },
});
