import { defineComponent, PropType, computed, Ref } from "vue";
import router from "@/router";
import { useButtonClasses } from "@/hooks/elements/useButtonClasses";
import { useDetailListClasses } from "@/hooks/elements/useDetailListClasses";
import { ExportData, getExportLocation } from "./useExportData";
import { useTokenIconUrl } from "@/hooks/useTokenIconUrl";
import ExportDetailsDisplay from "./ExportDetailsDisplay";
import { useCore } from "@/hooks/useCore";
import { getBlockExplorerUrl } from "@/componentsLegacy/shared/utils";
import { useTransactionDetails } from "@/hooks/useTransactionDetails";

export default defineComponent({
  name: "ExportProcessingModal",
  props: {
    exportData: {
      type: Object as PropType<ExportData>,
      required: true,
    },
  },
  setup(props) {
    const { config, usecases } = useCore();

    const { transactionStatusRef, exportParams } = props.exportData;

    const transactionDetails = useTransactionDetails({
      tx: transactionStatusRef,
    });

    // If user refreshed on confirm screen, just clsoe it...
    // We don't have the tx in memory anymore.
    // This doesn't work right now
    // effect(() => {
    //   if (!transactionDetails.value) {
    //     router.replace({ name: "Balances" });
    //   }
    // });

    const listClasses = useDetailListClasses();
    const buttonClasses = useButtonClasses();

    const symbolRef = computed(() => exportParams.symbol);
    const iconUrlRef = useTokenIconUrl({
      symbol: symbolRef as Ref,
    });

    return () => (
      <>
        <div class="p-4 bg-gray-base rounded-lg">
          <ExportDetailsDisplay withDestination exportData={props.exportData} />
        </div>
        <p class="mt-[10px] text-sm text-center">
          {transactionDetails.value?.description}
        </p>
        {!!transactionDetails.value?.tx && (
          <button
            class={`${buttonClasses.button} w-full mt-[10px]`}
            onClick={() => {
              router.replace({ name: "Balances" });
            }}
          >
            Close
          </button>
        )}
      </>
    );
  },
});
