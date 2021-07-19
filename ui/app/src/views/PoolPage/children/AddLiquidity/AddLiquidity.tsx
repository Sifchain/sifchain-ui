import { Button } from "@/components/Button/Button";
import { Form } from "@/components/Form";
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
import { useAddLiquidityData } from "./useAddLiquidityData";

export default defineComponent({
  setup() {
    const data = useAddLiquidityData();
    const router = useRouter();
    const formattedFromTokenBalance = useFormattedTokenBalance(data.fromSymbol);
    const formattedToTokenBalance = useFormattedTokenBalance(data.toSymbol);
    data.fromAmount.value = "1";
    data.handleTokenAFocused();
    const appWalletPicker = useAppWalletPicker();
    return () => (
      <Modal
        heading="Add Liquidity"
        icon="interactive/plus"
        showClose
        headingAction={
          <div
            onClick={() => {
              data.toggleAsyncPooling();
              data.handleTokenAFocused();
            }}
            class="flex items-center justify-start gap-[9px] cursor-pointer"
          >
            <button
              class={[
                `cursor-pointer flex transition-all items-center h-[16px] w-[28px] border-solid active:bg-opacity-20  border-[1px] rounded-full`,
                data.asyncPooling.value
                  ? `border-[#5AF37C] active:bg-[#5AF37C] `
                  : `border-danger-base active:bg-danger-base`,
              ]}
            >
              <TransitionGroup name="flip-list--fast">
                {data.asyncPooling.value && (
                  <div
                    key="pod"
                    class={[
                      `transition-all ml-auto  w-[12px] h-[12px] m-[1px] rounded-full`,
                      data.asyncPooling.value
                        ? `bg-[#5AF37C]`
                        : `bg-danger-base`,
                    ]}
                  ></div>
                )}
                {!data.asyncPooling.value && (
                  <div
                    key="pod"
                    class={[
                      `transition-all w-[12px] h-[12px] m-[1px] rounded-full`,
                      data.asyncPooling.value
                        ? `bg-[#5AF37C]`
                        : `bg-danger-base`,
                    ]}
                  ></div>
                )}
              </TransitionGroup>
            </button>
            <div class={[`font-medium`]}>Pool Equally</div>
          </div>
        }
        onClose={() => {
          router.push({
            name: "Pool",
          });
        }}
      >
        <TokenInputGroup
          shouldShowNumberInputOnLeft
          heading="Input"
          asset={data.fromAsset.value}
          amount={data.fromAmount.value}
          formattedBalance={formattedFromTokenBalance.value}
          onSetToMaxAmount={data.handleFromMaxClicked}
          onBlur={data.handleBlur}
          onFocus={data.handleTokenAFocused}
          onInputAmount={(v) => {
            data.fromAmount.value = v;
          }}
          class="mb-[-12px]"
          onSelectAsset={(asset) => {
            data.fromSymbol.value = asset.symbol;
          }}
        ></TokenInputGroup>
        <div
          key="button"
          class="flex relative items-center justify-center w-full z-20 overflow-hidden"
        >
          <button
            class="origin-center actidve:rotate-180 transition-transform flex items-center relative bg-gray-base border-gray-input_outline py-[6px] px-[8px] box-content border-[1px] rounded-[10px]"
            key="button"
          >
            <AssetIcon
              size={22}
              class=" text-white"
              icon="interactive/plus"
            ></AssetIcon>
          </button>
        </div>
        <TokenInputGroup
          selectDisabled
          shouldShowNumberInputOnLeft
          heading="Input"
          asset={data.toAsset.value}
          amount={data.toAmount.value}
          formattedBalance={formattedToTokenBalance.value}
          onSetToMaxAmount={data.handleToMaxClicked}
          onBlur={data.handleBlur}
          onFocus={data.handleTokenBFocused}
          onInputAmount={(v) => {
            data.toAmount.value = v;
          }}
          class="mt-[-12px]"
          onSelectAsset={(asset) => {
            data.toSymbol.value = asset.symbol;
          }}
        ></TokenInputGroup>
        <div class="font-medium mt-[10px] pt-[1em] text-left">
          Pool Token Prices
        </div>
        <Form.Details
          details={[
            [
              <span>
                <span class="uppercase">
                  {data.fromAsset.value?.displaySymbol}
                </span>{" "}
                per{" "}
                <span class="uppercase">
                  {data.toAsset.value?.displaySymbol}
                </span>
              </span>,
              <div class="flex items-center gap-[4px]">
                <div>{data.aPerBRatioMessage.value}</div>
                <TokenIcon asset={data.fromAsset}></TokenIcon>
              </div>,
            ],
            [
              <span>
                <span class="uppercase">
                  {data.toAsset.value?.displaySymbol}
                </span>{" "}
                per{" "}
                <span class="uppercase">
                  {data.fromAsset.value?.displaySymbol}
                </span>
              </span>,
              <div class="flex items-center gap-[4px]">
                <div>{data.bPerARatioMessage.value}</div>
                <TokenIcon asset={data.toAsset}></TokenIcon>
              </div>,
            ],
          ]}
        ></Form.Details>
        <div class="font-medium mt-[10px] pt-[1em] text-left">
          Est. prices after pooling & pool share
        </div>
        <Form.Details
          details={[
            [
              <span>
                <span class="uppercase">
                  {data.fromAsset.value?.displaySymbol}
                </span>{" "}
                per{" "}
                <span class="uppercase">
                  {data.toAsset.value?.displaySymbol}
                </span>
              </span>,
              <div class="flex items-center gap-[4px]">
                <div>{data.aPerBRatioProjectedMessage.value}</div>
                <TokenIcon asset={data.fromAsset}></TokenIcon>
              </div>,
            ],
            [
              <span>
                <span class="uppercase">
                  {data.toAsset.value?.displaySymbol}
                </span>{" "}
                per{" "}
                <span class="uppercase">
                  {data.fromAsset.value?.displaySymbol}
                </span>
              </span>,
              <div class="flex items-center gap-[4px]">
                <div>{data.bPerARatioProjectedMessage.value}</div>
                <TokenIcon asset={data.toAsset}></TokenIcon>
              </div>,
            ],
            [
              <span>Share of Pool</span>,
              <div class="flex items-center gap-[4px]">
                <div>{data.shareOfPoolPercent.value}</div>
              </div>,
            ],
          ]}
        ></Form.Details>
        {(data.nextStepAllowed.value && (
          <Button.CallToAction
            onClick={() => data.handleNextStepClicked()}
            class="mt-[10px]"
          >
            Add Liquidity
          </Button.CallToAction>
        )) || (
          <Button.CallToAction
            disabled={!data.nextStepAllowed.value}
            onClick={() => appWalletPicker.show()}
            class="mt-[10px]"
          >
            {/* <AssetIcon icon={"interactive/arrows-in"} class="mr-[4px]" />{" "} */}
            {data.nextStepMessage.value}
          </Button.CallToAction>
        )}
      </Modal>
    );
  },
});
