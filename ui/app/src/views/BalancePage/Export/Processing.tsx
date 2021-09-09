import { computed, defineComponent, Ref, ref } from "vue";
import { useExportData } from "./useExportData";
import TransactionDetailsModal from "@/components/TransactionDetailsModal";
import { Asset, Network } from "@sifchain/sdk";
import { Button } from "@/components/Button/Button";
import { suggestEthereumAsset } from "@sifchain/sdk/src/services/EthereumService/utils/ethereumUtils";
import { useCore } from "@/hooks/useCore";
import { exportStore } from "@/store/modules/export";
import { getTokenIconUrl } from "@/utils/getTokenIconUrl";
import { convertImageUrlToDataUrl } from "@/utils/convertImageUrlToDataUrl";

export default defineComponent({
  name: "ExportProcessingModal",
  props: {},
  setup() {
    const exportData = useExportData();
    const hasAddedToken = ref(false);

    const shouldAskToAddToken = computed(() => {
      return (
        exportStore.state.draft.network === Network.ETHEREUM &&
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
        const asset = exportData.targetTokenRef.value?.asset;
        const address =
          (await useCore().services.ethbridge.fetchSymbolAddress(
            exportStore.state.draft.symbol,
          )) || "0x0000000000000000000000000000000000000000";
        const imageUrl = getTokenIconUrl(asset, window.location.origin);
        // convert to data url to ensure image longevity & decrease metamask dependency on our asset path structure
        await suggestEthereumAsset(asset, address, (asset) =>
          imageUrl
            ? convertImageUrlToDataUrl(imageUrl).catch((e) => {
                console.error(e);
                return undefined;
              })
            : undefined,
        );
        hasAddedToken.value = true;
      }
    };

    // setTimeout(handleSuggestAsset, 1000);
    return () => {
      return (
        <TransactionDetailsModal
          transactionDetails={exportData.unpegEventDetails}
          network={exportStore.state.draft.network}
          completedCta={completedCtaRef as Ref<JSX.Element>}
          icon="interactive/arrow-up"
          details={exportData.detailsRef}
          onClose={exportData.exitExport}
        />
      );
    };
  },
});
