import { Network } from "@sifchain/sdk";
import { computed, defineComponent, Ref, ref } from "vue";

import { Button } from "~/components/Button/Button";
import TransactionDetailsModal from "~/components/TransactionDetailsModal";
import { useCore } from "~/hooks/useCore";
import { exportStore } from "~/store/modules/export";
import { convertImageUrlToDataUrl } from "~/utils/convertImageUrlToDataUrl";
import { getTokenIconUrl } from "~/utils/getTokenIconUrl";
import { useExportData } from "./useExportData";

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
          (await useCore().services.ethbridge.fetchTokenAddress(
            useCore().services.wallet.metamaskProvider,
            asset,
          )) || "0x0000000000000000000000000000000000000000";

        const imageUrl = getTokenIconUrl(asset, window.location.origin);
        // convert to data url to ensure image longevity & decrease metamask dependency on our asset path structure
        const getImageUrl = () => {
          return imageUrl
            ? convertImageUrlToDataUrl(imageUrl).catch((e) => {
                console.error(e);
                return undefined;
              })
            : undefined;
        };

        await useCore().services.wallet.metamaskProvider.suggestEthereumAsset(
          asset,
          getImageUrl,
          address,
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
