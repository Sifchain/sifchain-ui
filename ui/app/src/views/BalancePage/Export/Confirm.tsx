import { defineComponent, PropType, computed, Ref } from "vue";
import router from "@/router";
import Modal from "@/components/Modal";
import { getExportLocation, useExportData } from "./useExportData";
import { Form } from "@/components/Form";
import { Button } from "@/components/Button/Button";
import { exportStore } from "@/store/modules/export";

export default defineComponent({
  name: "ExportConfirmModal",
  setup(props) {
    const exportData = useExportData();
    return () => (
      <Modal
        heading={exportData.headingRef.value}
        icon="interactive/arrow-up"
        onClose={exportData.exitExport}
        showClose
      >
        <div class="p-4 bg-gray-base rounded-lg">
          <Form.Details details={exportData.detailsRef.value} />
        </div>
        <Button.CallToAction
          class="w-full mt-[10px]"
          onClick={() => {
            exportData.runExport();
            router.push(
              getExportLocation("processing", exportStore.state.draft),
            );
          }}
        >
          Confirm
        </Button.CallToAction>
      </Modal>
    );
  },
});
