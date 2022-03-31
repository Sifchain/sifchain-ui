import { defineComponent } from "vue";
import router from "@/router";
import Modal from "@/components/Modal";
import { getExportLocation, useExportData } from "./useExportData";
import { Form } from "@/components/Form";
import { Button } from "@/components/Button/Button";
import { exportStore } from "@/store/modules/export";

export default defineComponent({
  name: "ExportConfirmModal",
  setup() {
    const exportData = useExportData();
    const exportNetwork = exportStore.refs.draft.network.computed();
    return () => (
      <Modal
        heading={exportData.headingRef.value}
        icon="interactive/arrow-up"
        onClose={exportData.exitExport}
        showClose
      >
        <div class="p-4 bg-gray-base rounded-lg">
          <Form.Details details={exportData.detailsRef.value} />
        </div>

        {
          // If it's an IBC export of a token w/ high precision (needs to be batched)
          // warn user about high fees and point them to the github issue so we can get community
          // support
          // Leave commented out until we determine the path forward for
          // exportNetwork.value === Network.COSMOSHUB &&
          //   exportData?.computedExportAssetAmount?.value?.asset?.decimals &&
          //   exportData?.computedExportAssetAmount?.value?.asset?.decimals >=
          //     18 &&
          //   exportData?.computedExportAssetAmount.value?.amount.greaterThanOrEqual(
          //     "1000",
          //   ) && (
          //     <p class="mt-[10px] text-base">
          //       <div class="font-bold">Please Note *</div>
          //       Your funds will be available for use on Sifchain after about 10
          //       minutes. However in some rare cases, this action can take up to
          //       60 minutes.
          //     </p>
          //   )
        }
        <Button.CallToAction
          class="w-full mt-[10px]"
          onClick={() => {
            exportData.runExport();
            router.push(
              getExportLocation("processing", exportStore.state.draft),
            );
          }}
        >
          Confirm
        </Button.CallToAction>
      </Modal>
    );
  },
});
