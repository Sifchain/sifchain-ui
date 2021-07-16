import { ref } from "vue";
import { useDetailListClasses } from "@/hooks/elements/useDetailListClasses";
import { ExportData, getExportLocation } from "./useExportData";
import { TokenIcon } from "@/components/TokenIcon";
import { formatAssetAmount } from "@/componentsLegacy/shared/utils";
import { useCore } from "@/hooks/useCore";
import { Input } from "@/components/Input/Input";
import { Button } from "@/components/Button/Button";

export default function ExportDetailsDisplay(props: {
  exportData: ExportData;
  withDestination?: boolean;
}) {
  const { store } = useCore();
  const listClasses = useDetailListClasses();
  const { exportParams, exportTokenRef, feeAmountRef } = props.exportData;

  const assetRef = ref(exportTokenRef.value.asset);

  return (
    <>
      <div class={listClasses.list}>
        {props.withDestination && (
          <div class={listClasses.item}>
            <span>Destination</span>
            <span class="capitalize">{exportParams.network}</span>
          </div>
        )}
        <div class={listClasses.item}>
          <span>Export Amount</span>
          {exportParams.amount && (
            <span class="flex items-center">
              {exportParams.amount} {exportParams.symbol.toUpperCase()}
              <TokenIcon class="ml-[4px]" asset={assetRef} size={16} />
            </span>
          )}
        </div>
        <div class={listClasses.item}>
          <span class="flex items-center">
            Transaction Fee
            <Button.InlineHelp>
              <div class="w-[200px]">
                This is a fixed fee amount. This is a temporary solution as we
                are working towards improving this amount in upcoming versions
                of the network.
              </div>
            </Button.InlineHelp>
          </span>
          <span>
            {!feeAmountRef.value ? null : formatAssetAmount(feeAmountRef.value)}{" "}
            {(
              feeAmountRef.value.asset.displaySymbol ||
              feeAmountRef.value.asset.symbol
            ).toUpperCase()}
          </span>
        </div>
      </div>
    </>
  );
}
