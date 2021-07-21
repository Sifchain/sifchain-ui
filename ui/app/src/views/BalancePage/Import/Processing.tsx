import { defineComponent, PropType, computed, Ref } from "vue";
import { ImportData } from "./useImportData";
import { usePegEventDetails } from "@/hooks/useTransactionDetails";
import TransactionDetailsModal from "@/components/TransactionDetailsModal";

export default defineComponent({
  name: "ImportProcessingModal",
  props: {
    importData: {
      type: Object as PropType<ImportData>,
      required: true,
    },
  },
  setup(props) {
    const { pegEventRef, importParams } = props.importData;

    const transactionDetails = usePegEventDetails({
      pegEvent: pegEventRef,
    });

    return () => (
      <TransactionDetailsModal
        transactionDetails={transactionDetails}
        icon="interactive/arrow-down"
        onClose={props.importData.exitImport}
        details={props.importData.detailsRef}
      />
    );
  },
});
