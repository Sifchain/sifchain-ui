import { RouteLocationRaw, useRoute } from "vue-router";
import { Button } from "@/components/Button/Button";
import { reactive, ref, computed, Ref, watch } from "vue";
import router from "@/router";
import { TokenIcon } from "@/components/TokenIcon";
import { TokenListItem, useToken } from "@/hooks/useToken";
import {
  formatAssetAmount,
  getUnpeggedSymbol,
} from "@/componentsLegacy/shared/utils";
import { useCore } from "@/hooks/useCore";
import { Network, IAssetAmount, AssetAmount } from "@sifchain/sdk";
import { TransactionStatus } from "@sifchain/sdk";

export type ExportParams = {
  amount?: string;
  network: Network;
  symbol: string;
};

export type ExportStep = "select" | "confirm" | "processing";

export type ExportData = {
  exportParams: ExportParams;
  networksRef: Ref<Network[]>;
  exportTokenRef: Ref<TokenListItem>;
  exportAmountRef: Ref<IAssetAmount>;
  feeAmountRef: Ref<IAssetAmount>;
  targetTokenRef: Ref<TokenListItem>;
  detailsRef: Ref<[any, any][]>;
  headingRef: Ref<string>;
  runExport: () => void;
  exitExport: () => void;

  transactionStatusRef: Ref<TransactionStatus>;
};

export function getExportLocation(
  step: ExportStep,
  params: ExportParams,
): RouteLocationRaw {
  return {
    name: "Export",
    params: { step, symbol: params.symbol },
    query: {
      network: params.network,
      amount: params.amount,
    },
  } as RouteLocationRaw;
}

export const useExportData = () => {
  const { store, usecases } = useCore();
  const route = useRoute();

  const exportParams = reactive<ExportParams>({
    symbol: String(route.params.symbol || ""),
    network: String(route.query.network || "") as Network,
    amount: String(route.query.amount || ""),
  });

  watch(
    () => exportParams,
    (value) => {
      router.replace(getExportLocation(route.params.step as ExportStep, value));
    },
    { deep: true },
  );

  const headingRef = computed(
    () => `Export ${exportParams.symbol.toUpperCase()} from Sifchain`,
  );

  const exitExport = () => router.replace({ name: "Balances" });

  const exportTokenRef = useToken({
    network: ref(Network.SIFCHAIN),
    symbol: computed(() => exportParams.symbol),
  });

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
    getUnpeggedSymbol(exportParams.symbol),
  );
  const targetTokenRef = useToken({
    network: computed(() => exportParams.network),
    symbol: targetSymbolRef,
  });

  const exportAmountRef = computed(() => {
    if (!exportTokenRef.value) return null;
    return AssetAmount(
      exportTokenRef.value?.asset,
      exportParams.amount?.trim() || "0.0",
    );
  });

  const transactionStatusRef = ref<TransactionStatus>();
  async function runExport() {
    if (!exportAmountRef.value) throw new Error("Please provide an amount");
    transactionStatusRef.value = {
      state: "requested",
      hash: "",
    };
    transactionStatusRef.value = await usecases.peg.unpeg(
      exportAmountRef.value,
    );
  }

  const detailsRef = computed<[any, any][]>(() => [
    ["Destination", <span class="capitalize">{exportParams.network}</span>],
    [
      "Export Amount",
      !exportParams.amount ? null : (
        <span class="flex items-center">
          {exportParams.amount} {exportParams.symbol.toUpperCase()}
          <TokenIcon
            class="ml-[4px]"
            assetValue={exportTokenRef.value?.asset}
            size={16}
          />
        </span>
      ),
    ],
    [
      <>
        Transaction Fee
        <Button.InlineHelp>
          <div class="w-[200px]">
            This is a fixed fee amount. This is a temporary solution as we are
            working towards improving this amount in upcoming versions of the
            network.
          </div>
        </Button.InlineHelp>
      </>,
      <>
        {!feeAmountRef.value ? null : formatAssetAmount(feeAmountRef.value)}{" "}
        {(
          feeAmountRef.value?.asset.displaySymbol ||
          feeAmountRef.value?.asset.symbol ||
          ""
        ).toUpperCase()}
      </>,
    ],
  ]);

  return {
    exportParams: exportParams,
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
  } as ExportData;
};
