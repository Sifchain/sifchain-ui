import { defineComponent, PropType } from "vue";
import { ref } from "vue";
import router from "@/router";
import Modal from "@/components/Modal";
import { ImportData, getImportLocation } from "./useImportData";

export default defineComponent({
  name: "ImportConfirmModal",
  props: {
    importData: {
      type: Object as PropType<ImportData>,
      required: true,
    },
  },
  setup(props) {
    const { importParams } = props.importData;

    return () => (
      <button
        onClick={() => {
          router.replace(getImportLocation("pending", importParams));
        }}
      >
        Confirm
      </button>
    );
  },
});
