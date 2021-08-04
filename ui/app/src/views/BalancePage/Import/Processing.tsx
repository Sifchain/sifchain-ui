import { defineComponent, PropType, computed, Ref } from "vue";
import { useImportData } from "./useImportData";
import { usePegEventDetails } from "@/hooks/useTransactionDetails";
import TransactionDetailsModal from "@/components/TransactionDetailsModal";
import { PegEvent } from "../../../../../core/src/usecases/peg/peg";

export default defineComponent({
  name: "ImportProcessingModal",
  props: {},
  setup(props) {
    const {
      pegEventRef,
      importDraft,
      exitImport,
      detailsRef,
    } = useImportData();

    const transactionDetails = usePegEventDetails({
      pegEvent: pegEventRef as Ref<PegEvent>,
    });

    return () => (
      <TransactionDetailsModal
        transactionDetails={transactionDetails}
        icon="interactive/arrow-down"
        onClose={exitImport}
        details={detailsRef}
      />
    );
  },
});
