import Tooltip from "@/components/Tooltip";
import { useDetailListClasses } from "@/hooks/elements/useDetailListClasses";
import { ExportData, getExportLocation } from "./useExportData";
import AssetIcon from "@/componentsLegacy/utilities/AssetIcon";
import { formatAssetAmount } from "@/componentsLegacy/shared/utils";
import { useCore } from "@/hooks/useCore";

export default function ExportDetailsDisplay(props: {
  exportData: ExportData;
  withDestination?: boolean;
}) {
  const { store } = useCore();
  const listClasses = useDetailListClasses();
  const { exportParams, feeAmountRef } = props.exportData;

  return (
    <>
      <div class="text-white capitalize">
        {exportParams.network} Recipient Address
      </div>
      <div class="mt-[10px] relative h-[54px] bg-gray-input rounded-sm border border-solid border-gray-input_outline mb-[30px]">
        <input
          readonly
          value={store.wallet.eth.address}
          class="absolute top-0 left-0 w-full h-full bg-transparent p-[16px] font-mono outline-none"
          onClick={(e) => {
            (e.target as HTMLInputElement).setSelectionRange(0, 99999999);
          }}
        />
      </div>

      <div class={listClasses.list}>
        {props.withDestination && (
          <div class={listClasses.item}>
            <span>Destination</span>
            <span class="capitalize">{exportParams.network}</span>
          </div>
        )}
        <div class={listClasses.item}>
          <span>Export Amount</span>
          <span>
            {exportParams.amount} {exportParams.symbol.toUpperCase()}
          </span>
        </div>
        <div class={listClasses.item}>
          <span class="flex items-center">
            Transaction Fee
            <Tooltip
              content={
                <div class="text-center">
                  This is a fixed fee amount. This is a temporary solution as we
                  are working towards improving this amount in upcoming versions
                  of the network.
                </div>
              }
              delay={[300, 0]}
              arrow
            >
              <div class="cursor-pointer ml-[4px]">
                <AssetIcon
                  icon="interactive/help"
                  active
                  class="w-4 h-4"
                  style={{ stroke: "none" }}
                />
              </div>
            </Tooltip>
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
