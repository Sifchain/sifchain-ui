import { Button } from "@/components/Button/Button";
import { Form, FormDetailsType } from "@/components/Form";
import Modal from "@/components/Modal";
import { TokenIcon } from "@/components/TokenIcon";
import AssetIcon from "@/components/AssetIcon";
import { useAppWalletPicker } from "@/hooks/useAppWalletPicker";
import { useFormattedTokenBalance } from "@/hooks/useFormattedTokenBalance";
import { TokenInputGroup } from "@/views/SwapPage/components/TokenInputGroup";
import {
  computed,
  defineComponent,
  onBeforeUnmount,
  onUnmounted,
  TransitionGroup,
} from "vue";
import { useRouter } from "vue-router";
import { useAddLiquidityData } from "./useAddLiquidityData";
import TransactionDetailsModal from "@/components/TransactionDetailsModal";
import { useTransactionDetails } from "@/hooks/useTransactionDetails";
import { Tooltip } from "@/components/Tooltip";
import { effect } from "@vue/reactivity";

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

    effect(() => {
      console.log("state", data.state.value);
    });

    const close = () => {
      router.push({
        name: "Pool",
      });
    };

    const riskContent = computed(() => {
      if (data.riskFactorStatus.value && !data.asyncPooling.value) {
        return (
          <>
            This is an asymmetric liquidity add that has an estimated large
            impact on this pool, and therefore a significant slip adjustment.
            Please be aware of how this works by reading our documentation{" "}
            <a
              href="https://docs.sifchain.finance/core-concepts/liquidity-pool#asymmetric-liquidity-pool"
              target="_blank"
              class="underline"
            >
              here
            </a>
            .
          </>
        );
      }
    });

    const detailsRef = computed<FormDetailsType>(() => ({
      isError: !!riskContent.value,
      label: (
        <div class="flex justify-between items-center">
          <span>Est. prices after pooling & pool share</span>
          {!!riskContent.value && (
            <Tooltip
              content={riskContent.value}
              placement="top"
              interactive
              appendTo={() =>
                document.querySelector("#portal-target") || document.body
              }
            >
              <div class="cursor-pointer">
                <AssetIcon
                  icon="interactive/warning"
                  class="text-danger-base mr-[4px]"
                  size={22}
                />
              </div>
            </Tooltip>
          )}
        </div>
      ),
      details: [
        [
          <span>
            <span class="uppercase">{data.fromAsset.value?.displaySymbol}</span>{" "}
            per{" "}
            <span class="uppercase">{data.toAsset.value?.displaySymbol}</span>
          </span>,
          <div class="flex items-center gap-[4px] font-mono">
            <div>{data.aPerBRatioProjectedMessage.value}</div>
            <TokenIcon asset={data.fromAsset}></TokenIcon>
          </div>,
        ],
        [
          <span>
            <span class="uppercase">{data.toAsset.value?.displaySymbol}</span>{" "}
            per{" "}
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
      ],
    }));

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
              data.toAmount.value = v;
            }}
            excludeSymbols={["rowan"]}
            class=""
            onSelectAsset={(asset) => {
              data.toSymbol.value = asset.symbol;
            }}
          ></TokenInputGroup>
          <Form.Details
            class="mt-[10px]"
            details={{
              label: "Pool Token Price",
              details: [
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
              ],
            }}
          ></Form.Details>
          <Form.Details
            class="mt-[10px]"
            isError={!!data.riskFactorStatus.value}
            details={detailsRef.value}
          />
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
