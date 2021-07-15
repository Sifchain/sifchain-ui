import { Button } from "@/components/Button/Button";
import { FormDetails } from "@/components/FormDetails";
import Modal from "@/components/Modal";
import { Slider } from "@/components/Slider/Slider";
import { TokenIcon } from "@/components/TokenIcon";
import AssetIcon from "@/componentsLegacy/utilities/AssetIcon";
import { useAppWalletPicker } from "@/hooks/useAppWalletPicker";
import { useAssetBySymbol } from "@/hooks/useAssetBySymbol";
import { useFormattedTokenBalance } from "@/hooks/useFormattedTokenBalance";
import { SwapDetails } from "@/views/SwapPage/components/SwapDetails";
import { TokenInputGroup } from "@/views/SwapPage/components/TokenInputGroup";
import { computed, defineComponent, ref, TransitionGroup } from "vue";
import { useRouter } from "vue-router";
import { PoolState } from "../../../../../../core/src";
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
        <div class="w-full flex flex-row">
          <div class="w-full mt-[18px]">
            {" "}
            <Slider
              message={""}
              min="0"
              max="10000"
              value={data.wBasisPoints.value}
              disabled={
                !data.connected.value ||
                data.state.value === PoolState.NO_LIQUIDITY
              }
              onUpdate={(value) => {
                data.wBasisPoints.value = value;
              }}
              onLeftClicked={() => {
                data.wBasisPoints.value = "0";
              }}
              onMiddleClicked={() => {
                data.wBasisPoints.value = "5000";
              }}
              onRightClicked={() => {
                data.wBasisPoints.value = "10000";
              }}
              leftLabel="0%"
              middleLabel=""
              rightLabel="100%"
            ></Slider>
          </div>
          <div class="relative text-[20px] flex items-center w-[100px] ml-[20px] h-[54px] p-[8px] pl-0 rounded-[4px] bg-gray-input border-solid border-gray-input_outline border-[1px]">
            <input
              type="number"
              step="1"
              min="0"
              max="100"
              class="px-[10px] pr-0 h-[31px] w-full align-middle bg-transparent outline-none  text-right"
              value={((+data.wBasisPoints.value / 10000) * 100).toFixed(0)}
              onInput={(e) => {
                data.wBasisPoints.value = (
                  (+(e.target as HTMLInputElement).value / 100) *
                  10000
                ).toString();
              }}
            />
            <div class="pr-[10px] pointer-events-none select-none">%</div>
          </div>
        </div>
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
