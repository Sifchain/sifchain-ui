import { defineComponent, PropType, computed, Ref } from "vue";
import router from "@/router";
import Modal from "@/components/Modal";
import { ExportData, getExportLocation } from "./useExportData";
import { Form } from "@/components/Form";
import { Button } from "@/components/Button/Button";

export default defineComponent({
  name: "ExportConfirmModal",
  props: {
    exportData: {
      type: Object as PropType<ExportData>,
      required: true,
    },
  },
  setup(props) {
    return () => (
      <Modal
        heading={props.exportData.headingRef.value}
        icon="interactive/arrow-up"
        onClose={props.exportData.exitExport}
        showClose
      >
        <div class="p-4 bg-gray-base rounded-lg">
          <Form.Details details={props.exportData.detailsRef.value} />
        </div>
        <Button.CallToAction
          class="w-full mt-[10px]"
          onClick={() => {
            props.exportData.runExport();
            router.replace(
              getExportLocation("processing", props.exportData.exportParams),
            );
          }}
        >
          Confirm
        </Button.CallToAction>
      </Modal>
    );
  },
});
