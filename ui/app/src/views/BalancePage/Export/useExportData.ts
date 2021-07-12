import { RouteLocationRaw, useRoute } from "vue-router";
import { reactive, ref, computed, Ref, watch } from "vue";
import router from "@/router";
import { effect } from "@vue/reactivity";
import { TokenListItem, useTokenList, useToken } from "@/hooks/useToken";
import { getUnpeggedSymbol } from "@/componentsLegacy/shared/utils";
import { useCore } from "@/hooks/useCore";
import { Network, IAssetAmount, AssetAmount } from "@sifchain/sdk";
import { TransactionStatus } from "@sifchain/sdk";
import { PegSentEvent, PegTxError } from "@sifchain/sdk/src/usecases/peg/peg";

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
  runExport: () => void;

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
    transactionStatusRef.value = undefined;
    transactionStatusRef.value = await usecases.peg.unpeg(
      exportAmountRef.value,
    );
  }

  return {
    exportParams: exportParams,
    networksRef,
    exportTokenRef,
    targetTokenRef,
    runExport,
    exportAmountRef,
    transactionStatusRef,
    feeAmountRef,
  } as ExportData;
};
