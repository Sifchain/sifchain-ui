import { computed, defineComponent, Ref, ref } from "vue";
import { useExportData } from "./useExportData";
import TransactionDetailsModal from "@/components/TransactionDetailsModal";
import { Network } from "@sifchain/sdk";
import { Button } from "@/components/Button/Button";
import { suggestEthereumAsset } from "@sifchain/sdk/src/services/EthereumService/utils/ethereumUtils";

export default defineComponent({
  name: "ExportProcessingModal",
  props: {},
  setup() {
    const exportData = useExportData();
    const hasAddedToken = ref(false);

    const shouldAskToAddToken = computed(() => {
      return (
        exportData.targetTokenRef.value?.asset.network === Network.ETHEREUM &&
        exportData.exportTokenRef.value?.asset.homeNetwork !== Network.ETHEREUM
      );
    });

    const completedCtaRef = computed(() => {
      if (!shouldAskToAddToken.value) return;
      if (hasAddedToken.value) return;
      return (
        <Button.CallToAction class="mt-[10px]" onClick={handleSuggestAsset}>
          Add{" "}
          {exportData.targetTokenRef.value?.asset.displaySymbol.toUpperCase()}{" "}
          to Metamask
        </Button.CallToAction>
      );
    });

    const handleSuggestAsset = async () => {
      if (exportData.targetTokenRef.value?.asset) {
        await suggestEthereumAsset(exportData.targetTokenRef.value?.asset);
        hasAddedToken.value = true;
      }
    };

    return () => {
      return (
        <TransactionDetailsModal
          transactionDetails={exportData.unpegEventDetails}
          completedCta={completedCtaRef as Ref<JSX.Element>}
          icon="interactive/arrow-up"
          details={exportData.detailsRef}
          onClose={exportData.exitExport}
        />
      );
    };
  },
});
