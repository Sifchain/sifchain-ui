import { defineComponent, PropType, computed, Ref } from "vue";
import { useExportData } from "./useExportData";
import {
  usePegEventDetails,
  useTransactionDetails,
  useUnpegEventDetails,
} from "@/hooks/useTransactionDetails";
import TransactionDetailsModal from "@/components/TransactionDetailsModal";
import { UnpegEvent } from "../../../../../core/src/usecases/peg/unpeg";

export default defineComponent({
  name: "ExportProcessingModal",
  props: {},
  setup(props) {
    const exportData = useExportData();
    const { transactionStatusRef } = exportData;
    const transactionDetails = useUnpegEventDetails({
      unpegEvent: exportData.transactionStatusRef as Ref<UnpegEvent>,
    });

    return () => (
      <TransactionDetailsModal
        transactionDetails={transactionDetails}
        icon="interactive/arrow-up"
        details={exportData.detailsRef}
        onClose={exportData.exitExport}
      />
    );
  },
});
