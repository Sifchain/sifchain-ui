import { computed, defineComponent, Ref, ref } from "vue";
import { useTransferData } from "./useTransferData";
import TransactionDetailsModal from "@/components/TransactionDetailsModal";
import { Asset, Network } from "@sifchain/sdk";
import { Button } from "@/components/Button/Button";
import { useCore } from "@/hooks/useCore";
import { exportStore } from "@/store/modules/export";
import { getTokenIconUrl } from "@/utils/getTokenIconUrl";
import { convertImageUrlToDataUrl } from "@/utils/convertImageUrlToDataUrl";

export default defineComponent({
  name: "TransferProcessingModal",
  props: {},
  setup() {
    const exportData = useTransferData();
    const hasAddedToken = ref(false);

    const shouldAskToAddToken = computed(() => {
      return (
        exportStore.state.draft.network === Network.ETHEREUM &&
        exportData.exportTokenRef.value?.asset.homeNetwork !== Network.ETHEREUM
      );
    });

    // const completedCtaRef = computed(() => {
    //   if (!shouldAskToAddToken.value) return;
    //   if (hasAddedToken.value) return;
    //   return (
    //     <Button.CallToAction class="mt-[10px]" onClick={handleSuggestAsset}>
    //       Add{" "}
    //       {exportData.targetTokenRef.value?.asset.displaySymbol.toUpperCase()}{" "}
    //       to Metamask
    //     </Button.CallToAction>
    //   );
    // });

    // setTimeout(handleSuggestAsset, 1000);
    return () => {
      return (
        <TransactionDetailsModal
          transactionDetails={exportData.unpegEventDetails}
          network={exportStore.state.draft.network}
          icon="interactive/arrow-up"
          details={exportData.detailsRef}
          onClose={exportData.exitTransfer}
        />
      );
    };
  },
});
