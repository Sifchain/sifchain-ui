import { ref, computed, Ref } from "vue";
import { RouteLocationRaw, useRouter } from "vue-router";
import { toBaseUnits, Network, AssetAmount } from "@sifchain/sdk";

import { Button } from "~/components/Button/Button";
import { TokenIcon } from "~/components/TokenIcon";
import { useToken } from "~/hooks/useToken";
import { formatAssetAmount, getUnpeggedSymbol } from "~/components/utils";
import { useCore } from "~/hooks/useCore";

import { useBridgeEventDetails } from "~/hooks/useTransactionDetails";
import { rootStore } from "~/store";
import { useBoundRoute } from "~/hooks/useBoundRoute";
import { useChains } from "~/hooks/useChains";
import { accountStore } from "~/store/modules/accounts";
import { BridgeEvent } from "@sifchain/sdk/src/clients/bridges/BaseBridge";

export type ExportParams = {
  amount?: string;
  network: Network;
  symbol: string;
};

export type ExportStep = "setup" | "confirm" | "processing";

export function getExportLocation(
  step: ExportStep,
  params: ExportParams,
): RouteLocationRaw {
  const route: RouteLocationRaw = {
    name:
      step === "confirm"
        ? "ConfirmExport"
        : step === "processing"
        ? "ProcessingExport"
        : "Export",
    params: { symbol: params.symbol },
    query: {
      network: params.network ?? Network.ETHEREUM,
      amount: params.amount ?? "0",
    },
  };
  return route;
}

export const useExportData = () => {
  const router = useRouter();
  const exportStore = rootStore.export;
  const exportParams = exportStore.refs.draft.computed();

  useBoundRoute({
    params: {
      symbol: computed({
        get: () => exportStore.state.draft.symbol,
        set: (v) => exportStore.setDraft({ symbol: v }),
      }),
    },
    query: {
      network: computed({
        get: () => exportStore.state.draft.network,
        set: (v) => exportStore.setDraft({ network: v }),
      }),
      amount: computed({
        get: () => exportStore.state.draft.amount,
        set: (v) => exportStore.setDraft({ amount: v }),
      }),
    },
  });

  exportStore.setDraft({ network: Network.ETHEREUM });

  // Onload, set state to match the route params.
  const exitExport = () => router.push({ name: "Balances" });

  const exportTokenRef = useToken({
    network: ref(Network.SIFCHAIN),
    symbol: computed(() => exportParams.value.symbol),
    tokenListParams: {
      showDecomissionedAssets: true,
    },
  });

  const headingRef = computed(
    () =>
      `Export ${(
        exportTokenRef.value?.asset?.displaySymbol ||
        exportTokenRef.value?.asset?.symbol
      )?.toUpperCase()} from Sifchain`,
  );

  const feeAmountRef = computed(() => {
    if (!computedExportAssetAmount.value || !exportTokenRef.value) return null;

    const transferParams = {
      fromChain: useChains().get(Network.SIFCHAIN),
      toChain: useChains().get(exportStore.state.draft.network),
      assetAmount: computedExportAssetAmount.value,
      fromAddress: accountStore.state[Network.SIFCHAIN].address,
      toAddress: accountStore.state[exportStore.state.draft.network].address,
    };
    return useCore()
      .usecases.interchain(transferParams.fromChain, transferParams.toChain)
      .estimateFees(transferParams);
  });

  const feeAssetBalanceRef = computed(() => {
    if (!feeAmountRef.value?.network) return;
    return accountStore.state[feeAmountRef.value?.network].balances.find(
      (asset) => {
        return asset.symbol === feeAmountRef.value?.symbol;
      },
    );
  });

  const networksRef = computed(() =>
    rootStore.export.getters.chains.map((c) => c.network),
  );

  const targetSymbolRef = computed(() =>
    getUnpeggedSymbol(exportParams.value.symbol),
  );
  const targetTokenRef = useToken({
    network: computed(() => exportParams.value.network),
    symbol: targetSymbolRef,
    tokenListParams: {
      showDecomissionedAssets: true,
    },
  });

  const computedExportAssetAmount = computed(() => {
    if (!exportTokenRef.value) return null;
    return AssetAmount(
      exportTokenRef.value?.asset,
      toBaseUnits(
        exportParams.value.amount?.trim() || "0.0",
        exportTokenRef.value?.asset,
      ),
    );
  });

  const unpegEventRef = exportStore.refs.draft.unpegEvent.computed();
  const unpegEventDetails = useBridgeEventDetails({
    bridgeEvent: unpegEventRef as Ref<BridgeEvent>,
  });

  // underscored to signify that it is not to be used across the app.
  const detailsRef = computed(
    () =>
      [
        [
          "Destination",
          <span class="capitalize">{exportParams.value.network}</span>,
        ],
        [
          "Export Amount",
          !exportParams.value.amount ? null : (
            <span class="flex items-center font-mono">
              {exportParams.value.amount}{" "}
              {(
                exportTokenRef.value?.asset.displaySymbol ||
                exportTokenRef.value?.asset.symbol ||
                ""
              ).toUpperCase()}
              <TokenIcon
                class="ml-[4px]"
                key={exportTokenRef.value?.asset.symbol || "undef"}
                assetValue={exportTokenRef.value?.asset}
                size={16}
              />
            </span>
          ),
        ],
        feeAmountRef.value?.amount?.greaterThan("0") && [
          <>
            Export Fee
            <Button.InlineHelp key={exportStore.state.draft.network}>
              <div class="w-[200px]">
                {exportStore.state.draft.network === Network.ETHEREUM
                  ? `This is a fixed fee amount. This is a temporary solution as we are working towards improving this amount in upcoming versions of the network.`
                  : `This is a fixed UI fee amount. IBC relayers are expensive and this helps us keep the lights on.`}
              </div>
            </Button.InlineHelp>
          </>,
          <span class="flex items-center font-mono">
            {!feeAmountRef.value
              ? null
              : formatAssetAmount(feeAmountRef.value).replace(/0+$/, "")}{" "}
            {(
              feeAmountRef.value?.asset.displaySymbol ||
              feeAmountRef.value?.asset.symbol ||
              ""
            ).toUpperCase()}
            <TokenIcon
              size={16}
              class="ml-[4px]"
              assetValue={feeAmountRef.value?.asset}
            />
          </span>,
        ],
      ].filter(Boolean) as [any, any][],
  );

  return {
    networksRef,
    exportTokenRef,
    targetTokenRef,
    runExport: () =>
      computedExportAssetAmount.value &&
      exportStore.runExport({
        assetAmount: computedExportAssetAmount.value,
      }),
    computedExportAssetAmount,
    unpegEventRef,
    unpegEventDetails,
    feeAmountRef,
    feeAssetBalanceRef,
    headingRef,
    detailsRef,
    exitExport,
  };
};
