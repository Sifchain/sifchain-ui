import { defineComponent, PropType, computed, Ref } from "vue";
import Modal from "@/components/Modal";
import router from "@/router";
import { useButtonClasses } from "@/hooks/elements/useButtonClasses";
import { useDetailListClasses } from "@/hooks/elements/useDetailListClasses";
import { Button } from "@/components/Button/Button";
import { ImportData, getImportLocation } from "./useImportData";
import { useTokenIconUrl } from "@/hooks/useTokenIconUrl";

export default defineComponent({
  name: "ImportConfirmModal",
  props: {
    importData: {
      type: Object as PropType<ImportData>,
      required: true,
    },
  },
  setup(props) {
    const { importParams, runImport } = props.importData;
    const listClasses = useDetailListClasses();
    const buttonClasses = useButtonClasses();

    const symbolRef = computed(() => importParams.symbol);
    const iconUrlRef = useTokenIconUrl({
      symbol: symbolRef as Ref,
    });

    return () => (
      <Modal
        heading="Import Token to Sifchain"
        icon="interactive/arrow-down"
        onClose={props.importData.exitImport}
        showClose
      >
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
        </div>
        <p class="mt-[10px] text-sm">
          <div class="font-bold">Please Note *</div>
          Your funds will be available for use on Sifchain only after 50
          Ethereum block confirmations. This can take upwards of 20 minutes.
        </p>
        <Button.CallToAction
          class="mt-[10px]"
          onClick={() => {
            runImport();
            router.replace(getImportLocation("processing", importParams));
          }}
        >
          Confirm
        </Button.CallToAction>
      </Modal>
    );
  },
});
