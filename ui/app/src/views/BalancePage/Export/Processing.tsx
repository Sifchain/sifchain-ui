import { defineComponent, PropType, computed, Ref } from "vue";
import { ExportData } from "./useExportData";
import { useTransactionDetails } from "@/hooks/useTransactionDetails";
import TransactionDetailsModal from "@/components/TransactionDetailsModal";

export default defineComponent({
  name: "ExportProcessingModal",
  props: {
    exportData: {
      type: Object as PropType<ExportData>,
      required: true,
    },
  },
  setup(props) {
    const { transactionStatusRef } = props.exportData;
    const transactionDetails = useTransactionDetails({
      tx: transactionStatusRef,
    });

    return () => (
      <TransactionDetailsModal
        transactionDetails={transactionDetails}
        icon="interactive/arrow-up"
        details={props.exportData.detailsRef}
        onClose={props.exportData.exitExport}
      />
    );
  },
});
