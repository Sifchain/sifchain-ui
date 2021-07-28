import {
  defineComponent,
  PropType,
  computed,
  Ref,
  toRefs,
  proxyRefs,
} from "vue";
import Modal from "@/components/Modal";
import router from "@/router";
import { Button } from "@/components/Button/Button";
import { ImportData, getImportLocation } from "./useImportData";
import { Form } from "@/components/Form";
import { Network } from "../../../../../core/src";

export default defineComponent({
  name: "ImportConfirmModal",
  props: {
    importData: {
      type: Object as PropType<ImportData>,
      required: true,
    },
  },
  setup(props) {
    const { importParams: importParams, runImport } = toRefs(props.importData);
    return () => (
      <Modal
        heading="Import Token to Sifchain"
        icon="interactive/arrow-down"
        onClose={props.importData.exitImport}
        showClose
      >
        <div class="p-4 bg-gray-base rounded-lg">
          <Form.Details details={props.importData.detailsRef.value} />
        </div>
        {props.importData?.importAmountRef.value?.asset.network ===
          Network.ETHEREUM && (
          <p class="mt-[10px] text-base">
            <div class="font-bold">Please Note *</div>
            Your funds will be available for use on Sifchain only after 50
            Ethereum block confirmations. This can take upwards of 20 minutes.
          </p>
        )}
        <Button.CallToAction
          class="mt-[10px]"
          onClick={() => {
            runImport.value();
            router.replace(
              getImportLocation("processing", proxyRefs(importParams.value)),
            );
          }}
        >
          Confirm
        </Button.CallToAction>
      </Modal>
    );
  },
});
