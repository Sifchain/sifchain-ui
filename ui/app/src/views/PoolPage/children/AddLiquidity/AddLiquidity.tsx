import { Button } from "@/components/Button/Button";
import { Form } from "@/components/Form";
import Modal from "@/components/Modal";
import { TokenIcon } from "@/components/TokenIcon";
import AssetIcon from "@/components/AssetIcon";
import { useAppWalletPicker } from "@/hooks/useAppWalletPicker";
import { useAssetBySymbol } from "@/hooks/useAssetBySymbol";
import { useFormattedTokenBalance } from "@/hooks/useFormattedTokenBalance";
import { SwapDetails } from "@/views/SwapPage/components/SwapDetails";
import { TokenInputGroup } from "@/views/SwapPage/components/TokenInputGroup";
import { computed, defineComponent, ref, TransitionGroup } from "vue";
import { useRouter } from "vue-router";
import { useAddLiquidityData } from "./useAddLiquidityData";
import TransactionDetailsModal from "@/components/TransactionDetailsModal";
import { useTransactionDetails } from "@/hooks/useTransactionDetails";

export default defineComponent({
  setup() {
    const data = useAddLiquidityData();
    const router = useRouter();
    const formattedFromTokenBalance = useFormattedTokenBalance(data.fromSymbol);
    const formattedToTokenBalance = useFormattedTokenBalance(data.toSymbol);
    //data.fromAmount.value = "1";
    data.handleTokenAFocused();
    const appWalletPicker = useAppWalletPicker();

    const transactionDetails = useTransactionDetails({
      tx: data.transactionStatus,
    });

    const close = () => {
      router.push({
        name: "Pool",
      });
    };

    const detailsRef = computed<[any, any][]>(() => [
      [
        <span>
          <span class="uppercase">{data.fromAsset.value?.displaySymbol}</span>{" "}
          per <span class="uppercase">{data.toAsset.value?.displaySymbol}</span>
        </span>,
        <div class="flex items-center gap-[4px] font-mono">
          <div>{data.aPerBRatioProjectedMessage.value}</div>
          <TokenIcon asset={data.fromAsset}></TokenIcon>
        </div>,
      ],
      [
        <span>
          <span class="uppercase">{data.toAsset.value?.displaySymbol}</span> per{" "}
          <span class="uppercase">{data.fromAsset.value?.displaySymbol}</span>
        </span>,
        <div class="flex items-center gap-[4px] font-mono">
          <div>{data.bPerARatioProjectedMessage.value}</div>
          <TokenIcon asset={data.toAsset}></TokenIcon>
        </div>,
      ],
      [
        <span>Your Share of Pool</span>,
        <div class="flex items-center gap-[4px] font-mono">
          <div>{data.shareOfPoolPercent.value}</div>
        </div>,
      ],
    ]);

    return () => {
      if (data.modalStatus.value === "processing") {
        return (
          <TransactionDetailsModal
            icon="interactive/plus"
            onClose={close}
            details={detailsRef}
            transactionDetails={transactionDetails}
          />
        );
      }

      if (data.modalStatus.value === "confirm") {
        return (
          <Modal
            heading="Add Liquidity"
            icon="interactive/plus"
            showClose
            onClose={close}
          >
            <div class="p-4 bg-gray-base rounded-lg">
              <Form.Details details={detailsRef.value} />
            </div>
            <Button.CallToAction
              class="mt-[10px]"
              onClick={() => {
                data.handleAskConfirmClicked();
              }}
            >
              Confirm
            </Button.CallToAction>
          </Modal>
        );
      }
      return (
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
                    ? `border-connected-base active:bg-connected-base`
                    : `border-gray-800 active:bg-gray-800`,
                ]}
              >
                <TransitionGroup name="flip-list--fast">
                  {data.asyncPooling.value && (
                    <div
                      key="pod"
                      class={[
                        `transition-all ml-auto  w-[12px] h-[12px] m-[1px] rounded-full`,
                        data.asyncPooling.value
                          ? `bg-connected-base`
                          : `bg-gray-800`,
                      ]}
                    ></div>
                  )}
                  {!data.asyncPooling.value && (
                    <div
                      key="pod"
                      class={[
                        `transition-all w-[12px] h-[12px] m-[1px] rounded-full`,
                        data.asyncPooling.value
                          ? `bg-[connected-base]`
                          : `bg-gray-800`,
                      ]}
                    ></div>
                  )}
                </TransitionGroup>
              </button>
              <div class={[`font-medium`]}>Pool Equally</div>
            </div>
          }
          onClose={() => close()}
        >
          <TokenInputGroup
            shouldShowNumberInputOnLeft
            excludeSymbols={["rowan"]}
            heading="Input"
            asset={data.fromAsset.value}
            amount={data.fromAmount.value}
            formattedBalance={formattedFromTokenBalance.value}
            onSetToMaxAmount={data.handleFromMaxClicked}
            onBlur={data.handleBlur}
            onFocus={data.handleTokenAFocused}
            onInputAmount={(v) => {
              if (isNaN(parseFloat(v)) || parseFloat(v) < 0) {
                v = "0";
              }
              data.fromAmount.value = v;
            }}
            class=""
            onSelectAsset={(asset) => {
              data.fromSymbol.value = asset.symbol;
            }}
          ></TokenInputGroup>
          <div class="flex justify-center my-[4px]">
            <AssetIcon size={20} class=" text-white" icon="interactive/plus" />
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
              if (isNaN(parseFloat(v)) || parseFloat(v) < 0) {
                v = "0";
              }
              data.toAmount.value = v;
            }}
            excludeSymbols={["rowan"]}
            class=""
            onSelectAsset={(asset) => {
              data.toSymbol.value = asset.symbol;
            }}
          ></TokenInputGroup>
          <div class="font-medium mt-[10px] pt-[1em] text-left">
            Pool Token Prices
          </div>
          <Form.Details
            class="mt-[10px]"
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
                <div class="flex items-center gap-[4px] font-mono">
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
                <div class="flex items-center gap-[4px] font-mono">
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
            class="mt-[10px]"
            details={detailsRef.value}
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
    };
  },
});
