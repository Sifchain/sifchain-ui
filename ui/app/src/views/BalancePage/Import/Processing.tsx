import { defineComponent, PropType, Ref } from "vue";
import { useRouter } from "vue-router";

import { ImportData } from "./useImportData";
import { usePegEventDetails } from "@/hooks/useTransactionDetails";
import TransactionDetailsModal from "@/components/TransactionDetailsModal";
import { PegEvent } from "../../../../../core/src/usecases/peg/peg";
import { Network } from "@sifchain/sdk";

export default defineComponent({
  name: "ImportProcessingModal",
  props: {
    importData: {
      type: Object as PropType<ImportData>,
      required: true,
    },
  },
  setup(props) {
    const { pegEventRef } = props.importData;
    const router = useRouter();
    const network = router.currentRoute.value.query.network as Extract<
      Network,
      "ethereum" | "cosmoshub"
    >;
    const transactionDetails = usePegEventDetails({
      pegEvent: pegEventRef as Ref<PegEvent>,
    });

    return () => (
      <TransactionDetailsModal
        network={network}
        transactionDetails={transactionDetails}
        icon="interactive/arrow-down"
        onClose={props.importData.exitImport}
        details={props.importData.detailsRef}
      />
    );
  },
});
