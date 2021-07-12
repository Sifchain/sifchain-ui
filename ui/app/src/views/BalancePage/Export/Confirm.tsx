import { defineComponent, PropType, computed, Ref } from "vue";
import { ref } from "vue";
import router from "@/router";
import Tooltip from "@/components/Tooltip";
import { useButtonClasses } from "@/hooks/elements/useButtonClasses";
import { useDetailListClasses } from "@/hooks/elements/useDetailListClasses";
import Modal from "@/components/Modal";
import { ExportData, getExportLocation } from "./useExportData";
import { useTokenIconUrl } from "@/hooks/useTokenIconUrl";
import { useCore } from "@/hooks/useCore";
import AssetIcon from "@/componentsLegacy/utilities/AssetIcon";
import ExportDetailsDisplay from "./ExportDetailsDisplay";

export default defineComponent({
  name: "ExportConfirmModal",
  props: {
    exportData: {
      type: Object as PropType<ExportData>,
      required: true,
    },
  },
  setup(props) {
    const { store } = useCore();
    const { exportParams, runExport, feeAmountRef } = props.exportData;
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
        <button
          class={`${buttonClasses.button} w-full mt-[10px]`}
          onClick={() => {
            runExport();
            router.replace(getExportLocation("processing", exportParams));
          }}
        >
          Confirm
        </button>
      </>
    );
  },
});
