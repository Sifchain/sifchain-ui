import { Button } from "@/components/Button/Button";
import { FormDetails } from "@/components/FormDetails";
import Modal from "@/components/Modal";
import { TokenIcon } from "@/components/TokenIcon";
import AssetIcon from "@/componentsLegacy/utilities/AssetIcon";
import { useAppWalletPicker } from "@/hooks/useAppWalletPicker";
import { useAssetBySymbol } from "@/hooks/useAssetBySymbol";
import { useFormattedTokenBalance } from "@/hooks/useFormattedTokenBalance";
import { SwapDetails } from "@/views/SwapPage/components/SwapDetails";
import { TokenInputGroup } from "@/views/SwapPage/components/TokenInputGroup";
import { computed, defineComponent, ref, TransitionGroup } from "vue";
import { useRouter } from "vue-router";
import { useAddLiquidityData } from "../AddLiquidity/useAddLiquidityData";
import { useRemoveLiquidityData } from "./useRemoveLiquidityData";

export default defineComponent({
  setup(props) {
    const data = useRemoveLiquidityData();
    const router = useRouter();
    const appWalletPicker = useAppWalletPicker();
    return () => (
      <Modal
        teleportTo="#app"
        heading="Remove Liquidity"
        icon="interactive/minus"
        showClose
        onClose={() => {
          router.push({
            name: "Pool",
          });
        }}
      >
        {(data.nextStepAllowed.value && (
          <Button.CTA
            onClick={() => data.handleNextStepClicked()}
            class="mt-[10px]"
          >
            Remove Liquidity
          </Button.CTA>
        )) || (
          <Button.CTA onClick={() => appWalletPicker.show()} class="mt-[10px]">
            {/* <AssetIcon icon={"interactive/arrows-in"} class="mr-[4px]" />{" "} */}
            {data.nextStepMessage.value}
          </Button.CTA>
        )}
      </Modal>
    );
  },
});
