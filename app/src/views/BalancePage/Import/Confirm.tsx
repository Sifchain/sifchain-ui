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
import { getImportLocation, useImportData } from "./useImportData";
import { Form } from "@/components/Form";
import { Network } from "../../../../../core/src";

export default defineComponent({
  name: "ImportConfirmModal",
  props: {},
  setup(props) {
    const importData = useImportData();
    importData.detailsRef.value;
    const { runImport, exitImport } = toRefs(importData);
    const {
      importDraft: importDraft,
      computedImportAssetAmount,
      detailsRef,
    } = importData;
    return () => (
      <Modal
        heading="Import Token to Sifchain"
        icon="interactive/arrow-down"
        onClose={exitImport.value}
        showClose
      >
        <div class="p-4 bg-gray-base rounded-lg">
          <Form.Details details={detailsRef.value} />
        </div>
        {importDraft.value.network === Network.ETHEREUM && (
          <p class="mt-[10px] text-base">
            <div class="font-bold">Please Note *</div>
            Your funds will be available for use on Sifchain only after 50
            Ethereum block confirmations. This can take upwards of 20 minutes.
          </p>
        )}
        {importDraft.value.network === Network.COSMOSHUB && (
          <p class="mt-[10px] text-base">
            <div class="font-bold">Please Note *</div>
            Your funds will be available for use on Sifchain after about 10
            minutes. However in some rare cases, this action can take up to 60
            minutes.
          </p>
        )}
        <Button.CallToAction
          class="mt-[10px]"
          onClick={() => {
            runImport.value();
            const next = getImportLocation("processing", {
              ...importDraft.value,
              // txHash: importData.pegEventDetails.value?.tx?.hash,
            });
            console.log("pushing", next);
            router.push(next);
          }}
        >
          Confirm
        </Button.CallToAction>
      </Modal>
    );
  },
});
