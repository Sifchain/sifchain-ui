import { defineComponent, watchEffect } from "vue";
import { useRouter } from "vue-router";

import { importStore } from "~/store/modules/import";
import TransactionDetailsModal from "~/components/TransactionDetailsModal";

import { useImportData } from "./useImportData";

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
