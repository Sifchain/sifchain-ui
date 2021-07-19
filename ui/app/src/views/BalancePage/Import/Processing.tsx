import { defineComponent, PropType, computed, Ref } from "vue";
import { ImportData } from "./useImportData";
import { usePegEventDetails } from "@/hooks/useTransactionDetails";
import TransactionDetailsModal from "@/components/TransactionDetailsModal";
import { TokenIcon } from "@/components/TokenIcon";

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

    const symbolRef = computed(() => importParams.symbol);

    const detailsRef = computed<[any, any][]>(() => [
      [
        "Import Amount",
        <>
          {importParams.amount} {importParams.symbol?.toUpperCase()}
          <TokenIcon size={18} class="ml-[4px]" />
        </>,
      ],
      [
        "Direction",
        <span class="capitalize">
          {importParams.network}
          <span
            class="mx-[6px] inline-block"
            style={{ transform: "translateY(-1px)" }}
          >
            ⟶
          </span>
          Sifchain
        </span>,
      ],
    ]);

    return () => (
      <TransactionDetailsModal
        transactionDetails={transactionDetails}
        icon="interactive/arrow-down"
        onClose={props.importData.exitImport}
        details={detailsRef}
      />
    );
  },
});
