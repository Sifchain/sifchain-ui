import { defineComponent, PropType, computed, Ref } from "vue";
import { ref } from "vue";
import router from "@/router";
import { useButtonClasses } from "@/hooks/elements/useButtonClasses";
import { useDetailListClasses } from "@/hooks/elements/useDetailListClasses";
import Modal from "@/components/Modal";
import { ImportData, getImportLocation } from "./useImportData";
import { useTokenIconUrl } from "@/hooks/useTokenIconUrl";
import { PegEvent, PegApproveError } from "@sifchain/sdk/src/usecases/peg/peg";
import { useCore } from "@/hooks/useCore";
import { getBlockExplorerUrl } from "@/componentsLegacy/shared/utils";
import {
  TransactionDetails,
  usePegEventDetails,
} from "@/hooks/useTransactionDetails";
import { effect } from "@vue/reactivity";
import { Button } from "@/components/Button/Button";

export default defineComponent({
  name: "ImportProcessingModal",
  props: {
    importData: {
      type: Object as PropType<ImportData>,
      required: true,
    },
  },
  setup(props) {
    const pegEvent = ref<PegEvent>();
    const { config, usecases } = useCore();

    const { pegEventRef, importParams } = props.importData;

    const transactionDetails = usePegEventDetails({
      pegEvent: pegEventRef,
    });

    // If user refreshed on confirm screen, just clsoe it...
    // We don't have the tx in memory anymore.
    // This doesn't work right now
    // effect(() => {
    //   if (!transactionDetails.value) {
    //     router.replace({ name: "Balances" });
    //   }
    // });

    const listClasses = useDetailListClasses();
    const buttonClasses = useButtonClasses();

    const symbolRef = computed(() => importParams.symbol);
    const iconUrlRef = useTokenIconUrl({
      symbol: symbolRef as Ref,
    });

    return () => (
      <>
        <div class="p-4 bg-gray-base rounded-lg">
          <div class={listClasses.list}>
            <div class={listClasses.item}>
              <span>Import Amount</span>
              <span class="inline-flex items-center">
                {importParams.amount} {importParams.symbol?.toUpperCase()}
                <img
                  src={iconUrlRef.value}
                  class="w-[18px] h-[18px] ml-[4px]"
                />
              </span>
            </div>
            <div class={listClasses.item}>
              <span>Direction</span>
              <span class="capitalize">
                {importParams.network}
                <span
                  class="mx-[6px] inline-block"
                  style={{ transform: "translateY(-1px)" }}
                >
                  ⟶
                </span>
                Sifchain
              </span>
            </div>
          </div>
          {transactionDetails.value?.tx?.hash && (
            <a
              class="text-white block text-center cursor-pointer mt-[10px] text-sm"
              target="_blank"
              rel="noopener noreferrer"
              href={getBlockExplorerUrl(
                config.sifChainId,
                transactionDetails.value.tx.hash,
              )}
            >
              View Transaction on the Block Explorer
            </a>
          )}
        </div>
        <p class="mt-[10px] text-sm text-center">
          {transactionDetails.value?.description}
        </p>
        {!!transactionDetails.value?.tx && (
          <Button.CallToAction
            class="mt-[10px]"
            onClick={() => {
              router.replace({ name: "Balances" });
            }}
          >
            Close
          </Button.CallToAction>
        )}
      </>
    );
  },
});
