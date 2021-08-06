import { defineComponent } from "vue";
import { useExportData } from "./useExportData";
import TransactionDetailsModal from "@/components/TransactionDetailsModal";

export default defineComponent({
  name: "ExportProcessingModal",
  props: {},
  setup() {
    const exportData = useExportData();

    return () => (
      <TransactionDetailsModal
        transactionDetails={exportData.unpegEventDetails}
        icon="interactive/arrow-up"
        details={exportData.detailsRef}
        onClose={exportData.exitExport}
      />
    );
  },
});
