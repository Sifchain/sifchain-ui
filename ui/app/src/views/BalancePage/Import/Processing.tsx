import { defineComponent, PropType, computed, Ref } from "vue";
import { ImportData } from "./useImportData";
import { usePegEventDetails } from "@/hooks/useTransactionDetails";
import TransactionDetailsModal from "@/components/TransactionDetailsModal";
import { PegEvent } from "../../../../../core/src/usecases/peg/peg";

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
      pegEvent: pegEventRef as Ref<PegEvent>,
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
