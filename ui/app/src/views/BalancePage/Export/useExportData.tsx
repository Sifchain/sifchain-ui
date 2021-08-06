import { RouteLocationRaw, useRoute } from "vue-router";
import { Button } from "@/components/Button/Button";
import {
  reactive,
  ref,
  computed,
  Ref,
  watch,
  ComputedRef,
  onMounted,
} from "vue";
import router from "@/router";
import { TokenIcon } from "@/components/TokenIcon";
import { TokenListItem, useToken } from "@/hooks/useToken";
import { toBaseUnits } from "@sifchain/sdk/src/utils";
import {
  formatAssetAmount,
  getUnpeggedSymbol,
} from "@/componentsLegacy/shared/utils";
import { useCore } from "@/hooks/useCore";
import { Network, IAssetAmount, AssetAmount } from "@sifchain/sdk";
import { TransactionStatus } from "@sifchain/sdk";
import { FormDetailsType } from "@/components/Form";
import { exportStore, ExportDraft } from "@/store/modules/export";
import { UnpegEvent } from "../../../../../core/src/usecases/peg/unpeg";

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

  const exportParams = exportStore.refs.draft.computed();

  watch(
    exportStore.state.draft,
    (value) => {
      console.log("replacing!!!");
      if (
        !["amount", "symbol", "network"].every(
          (key) =>
            exportStore.state.draft[key as keyof ExportDraft] ===
            (route.query[key] || route.params[key]),
        )
      )
        router.push(
          getExportLocation(
            router.currentRoute.value.path.split("/").pop() as ExportStep,
            {
              ...value,
            },
          ),
        );
    },
    { deep: true, immediate: false },
  );

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

  const networksRef = computed(() => {
    // TODO: find all networks where the given token exists that are not sifchain.
    return Object.values(Network).filter((n) => n !== Network.SIFCHAIN);
  });

  const targetSymbolRef = computed(() =>
    getUnpeggedSymbol(exportParams.value.symbol),
  );
  const targetTokenRef = useToken({
    network: computed(() => exportParams.value.network),
    symbol: targetSymbolRef,
  });

  const exportAmountRef = computed(() => {
    if (!exportTokenRef.value) return null;
    return AssetAmount(
      exportTokenRef.value?.asset,
      toBaseUnits(
        exportParams.value.amount?.trim() || "0.0",
        exportTokenRef.value?.asset,
      ),
    );
  });

  const transactionStatusRef = exportStore.refs.draft.unpegEvent.computed();
  async function runExport() {
    if (!exportAmountRef.value) throw new Error("Please provide an amount");
    for await (let event of usecases.peg.unpeg(
      exportAmountRef.value,
      exportParams.value.network,
    )) {
      console.log(event);
      exportStore.setPegEvent(event);
    }
  }

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
  onMounted(() => {
    const route = router.currentRoute.value;
    if (
      !["amount", "symbol", "network"].every(
        (key) =>
          exportParams.value[key as keyof ExportDraft] ===
          (route.query[key] || route.params[key]),
      )
    ) {
      exportStore.setDraft({
        amount: (route.query.amount as string) || exportParams.value.amount,
        symbol:
          (route.params.symbol as string) || exportStore.state.draft.symbol,
        network:
          (route.params.network as Network) ||
          targetTokenRef.value?.asset.homeNetwork,
      });
    }
  });

  return {
    networksRef,
    exportTokenRef,
    targetTokenRef,
    runExport,
    exportAmountRef,
    transactionStatusRef,
    feeAmountRef,
    headingRef,
    detailsRef,
    exitExport,
  };
};
