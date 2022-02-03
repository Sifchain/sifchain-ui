import { defineComponent, PropType, computed, Ref, watchEffect } from "vue";
import { useImportData } from "./useImportData";
import { useBridgeEventDetails } from "@/hooks/useTransactionDetails";
import TransactionDetailsModal from "@/components/TransactionDetailsModal";
import { PegEvent } from "../../../../../core/src/usecases/peg/peg";
import { useRouter } from "vue-router";
import { importStore } from "@/store/modules/import";

export default defineComponent({
  name: "ImportProcessingModal",
  props: {},
  setup(props) {
    const { pegEventRef, exitImport, detailsRef, pegEventDetails } =
      useImportData();
    const router = useRouter();

    watchEffect(() => {
      if (!pegEventRef.value) {
        router.push({
          name: "Balances",
        });
      } else {
      }
    });
    return () => (
      <TransactionDetailsModal
        network={importStore.state.draft.network}
        transactionDetails={pegEventDetails}
        icon="interactive/arrow-down"
        onClose={exitImport}
        details={detailsRef}
      />
    );
  },
});
