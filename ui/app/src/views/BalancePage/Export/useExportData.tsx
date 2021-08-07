import { RouteLocationRaw, useRoute, useRouter } from "vue-router";
import { Button } from "@/components/Button/Button";
import { ref, computed, watch, onMounted, Ref } from "vue";
import router from "@/router";
import { TokenIcon } from "@/components/TokenIcon";
import { useToken } from "@/hooks/useToken";
import {
  formatAssetAmount,
  getUnpeggedSymbol,
} from "@/componentsLegacy/shared/utils";
import { useCore } from "@/hooks/useCore";
import { toBaseUnits, Network, AssetAmount } from "@sifchain/sdk";
import { exportStore, ExportDraft } from "@/store/modules/export";
import { UnpegEvent } from "../../../../../core/src/usecases/peg/unpeg";
import { useUnpegEventDetails } from "@/hooks/useTransactionDetails";
import { rootStore } from "@/store";

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
  return {
    name:
      step === "confirm"
        ? "ConfirmExport"
        : step === "processing"
        ? "ProcessingExport"
        : "Export",
    params: { symbol: params.symbol },
    query: {
      network: params.network || Network.ETHEREUM,
      amount: params.amount || "0",
    },
  } as RouteLocationRaw;
}

export const useExportData = () => {
  const { store, usecases } = useCore();
  const route = useRoute();
  const router = useRouter();
  const exportStore = rootStore.export;
  const exportDraft = exportStore.refs.draft.computed();

  const exportParams = exportStore.refs.draft.computed();

  watch(
    // Do not watch unpegEvent, that should not trigger a route change.
    // If it does, it will cause issues...
    () => [
      exportDraft.value.symbol,
      exportDraft.value.network,
      exportDraft.value.amount,
    ],
    ([symbol, network, amount]): void => {
      router.replace(
        getExportLocation(
          router.currentRoute.value.path.split("/").pop() as ExportStep,
          {
            symbol,
            network: network as Network,
            amount,
          },
        ),
      );
    },
    { immediate: false },
  );

  // Onload, set state to match the route params.
  onMounted(() => {
    if (
      !["amount", "symbol", "network"].every(
        (key) =>
          exportDraft.value[key as keyof ExportDraft] ===
          (route.query[key] || route.params[key]),
      )
    ) {
      exportStore.setDraft({
        amount: (route.query.amount as string) || exportDraft.value.amount,
        symbol: (route.params.symbol as string) || exportDraft.value.symbol,
        network: (route.params.network as Network) || exportDraft.value.network,
      });
    }
  });

  const exitExport = () => router.push({ name: "Balances" });

  const exportTokenRef = useToken({
    network: ref(Network.SIFCHAIN),
    symbol: computed(() => exportParams.value.symbol),
  });

  const headingRef = computed(
    () =>
      `Export ${(
        exportTokenRef.value?.asset?.displaySymbol ||
        exportTokenRef.value?.asset?.symbol
      )?.toUpperCase()} from Sifchain`,
  );

  const feeAmountRef = computed(() => {
    return exportTokenRef.value
      ? usecases.peg.calculateUnpegFee(exportTokenRef.value.asset)
      : null;
  });

  const networksRef = computed(() => rootStore.export.getters.networks);

  const targetSymbolRef = computed(() =>
    getUnpeggedSymbol(exportParams.value.symbol),
  );
  const targetTokenRef = useToken({
    network: computed(() => exportParams.value.network),
    symbol: targetSymbolRef,
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
  const unpegEventDetails = useUnpegEventDetails({
    unpegEvent: unpegEventRef as Ref<UnpegEvent>,
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
                assetValue={exportTokenRef.value?.asset}
                size={16}
              />
            </span>
          ),
        ],
        exportParams.value.network === Network.ETHEREUM && [
          <>
            Transaction Fee
            <Button.InlineHelp>
              <div class="w-[200px]">
                This is a fixed fee amount. This is a temporary solution as we
                are working towards improving this amount in upcoming versions
                of the network.
              </div>
            </Button.InlineHelp>
          </>,
          <span class="flex items-center font-mono">
            {!feeAmountRef.value ? null : formatAssetAmount(feeAmountRef.value)}{" "}
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
    headingRef,
    detailsRef,
    exitExport,
  };
};
