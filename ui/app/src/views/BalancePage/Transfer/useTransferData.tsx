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
import { transferStore, TransferDraft } from "@/store/modules/transfer";
import { useBridgeEventDetails } from "@/hooks/useTransactionDetails";
import { rootStore } from "@/store";
import { useBoundRoute } from "@/hooks/useBoundRoute";
import { useChains } from "@/hooks/useChains";
import { accountStore } from "@/store/modules/accounts";
import { BridgeEvent } from "@sifchain/sdk/src/clients/bridges/BaseBridge";

export type TransferParams = {
  amount?: string;
  network: Network;
  symbol: string;
};

export type TransferStep = "setup" | "confirm" | "processing";

export function getTransferLocation(
  step: TransferStep,
  params: TransferParams,
): RouteLocationRaw {
  const route: RouteLocationRaw = {
    name:
      step === "confirm"
        ? "ConfirmTransfer"
        : step === "processing"
        ? "ProcessingTransfer"
        : "Transfer",
    params: { symbol: params.symbol },
    query: {
      network: Network.SIFCHAIN,
      amount: params.amount ?? "0",
    },
  };
  return route;
}

export const useTransferData = () => {
  const { store, usecases } = useCore();
  const route = useRoute();
  const router = useRouter();
  const exportStore = rootStore.transfer;
  const exportDraft = exportStore.refs.draft.computed();
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
      address: computed({
        get: () => exportStore.state.draft.toAddress,
        set: (v) => exportStore.setDraft({ toAddress: v }),
      }),
    },
  });
  // sif1apmyeqmre5djkplp8qx4s0rf6ha3sw4fcuwcgg
  exportStore.setDraft({ network: Network.ETHEREUM });

  // Onload, set state to match the route params.
  const exitTransfer = () => router.push({ name: "Balances" });

  const exportTokenRef = useToken({
    network: ref(Network.SIFCHAIN),
    symbol: computed(() => exportParams.value.symbol),
    tokenListParams: {
      showDecomissionedAssets: true,
    },
  });

  const headingRef = computed(
    () =>
      `Transfer ${(
        exportTokenRef.value?.asset?.displaySymbol ||
        exportTokenRef.value?.asset?.symbol
      )?.toUpperCase()} on Sifchain`,
  );

  const feeAmountRef = computed(() => {
    return AssetAmount("rowan", "0");
  });

  const feeAssetBalanceRef = computed(() => {
    if (!feeAmountRef.value?.network) return;
    return accountStore.state[feeAmountRef.value?.network].balances.find(
      (asset) => {
        return asset.symbol === feeAmountRef.value?.symbol;
      },
    );
  });

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

  const computedTransferAssetAmount = computed(() => {
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
          "Transfer Amount",
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
        [
          "Recipient",
          <span class="font-mono text-xs">{exportParams.value.toAddress}</span>,
        ],
        feeAmountRef.value?.amount?.greaterThan("0") && [
          <>
            Transfer Fee
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
    exportTokenRef,
    targetTokenRef,
    runTransfer: () =>
      computedTransferAssetAmount.value &&
      exportStore.runTransfer({
        assetAmount: computedTransferAssetAmount.value,
        toAddress: exportStore.state.draft.toAddress,
        fromAddress: rootStore.accounts.state.sifchain.address,
      }),
    computedTransferAssetAmount,
    unpegEventRef,
    unpegEventDetails,
    feeAmountRef,
    feeAssetBalanceRef,
    headingRef,
    detailsRef,
    exitTransfer,
  };
};
