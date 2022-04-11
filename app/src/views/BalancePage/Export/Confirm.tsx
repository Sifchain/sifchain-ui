import { defineComponent } from "vue";
import router from "@/router";
import Modal from "@/components/Modal";
import { getExportLocation, useExportData } from "./useExportData";
import { Form } from "@/components/Form";
import { Button } from "@/components/Button/Button";
import { exportStore } from "@/store/modules/export";

export default defineComponent({
  name: "ExportConfirmModal",
  setup() {
    const exportData = useExportData();

    return () => (
      <Modal
        heading={exportData.headingRef.value}
        icon="interactive/arrow-up"
        onClose={exportData.exitExport}
        showClose
      >
        <div class="bg-gray-base rounded-lg p-4">
          <Form.Details details={exportData.detailsRef.value} />
        </div>
        <Button.CallToAction
          class="mt-[10px] w-full"
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
