import { computed, defineComponent } from "vue";
import { useRouter } from "vue-router";
import { Network } from "@sifchain/sdk";

import { useTransactionDetails } from "@/hooks/useTransactionDetails";
import { useAppWalletPicker } from "@/hooks/useAppWalletPicker";
import { useFormattedTokenBalance } from "@/hooks/useFormattedTokenBalance";
import { Button } from "@/components/Button/Button";
import { Form, FormDetailsType } from "@/components/Form";
import Modal from "@/components/Modal";
import { TokenIcon } from "@/components/TokenIcon";
import AssetIcon from "@/components/AssetIcon";
import TransactionDetailsModal from "@/components/TransactionDetailsModal";
import { Tooltip } from "@/components/Tooltip";
import Toggle from "@/components/Toggle";
import { TokenInputGroup } from "@/views/SwapPage/components/TokenInputGroup";

import { useAddLiquidityData } from "./useAddLiquidityData";

export default defineComponent({
  setup(): () => JSX.Element {
    const data = useAddLiquidityData();

    const router = useRouter();
    const formattedFromTokenBalance = useFormattedTokenBalance(data.fromSymbol);
    const formattedToTokenBalance = useFormattedTokenBalance(data.toSymbol);

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

    const riskContent = computed(() => {
      if (data.riskFactorStatus.value && !data.symmetricalPooling.value) {
        return (
          <>
            This is an asymmetric liquidity add that has an estimated large
            impact on this pool, and therefore a significant slip adjustment.
            Please be aware of how this works by reading our documentation{" "}
            <a
              href="https://docs.sifchain.finance/using-the-website/web-ui-step-by-step/pool/sifchain-liquidity-pools#asymmetric-liquidity-pool"
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
      details: [
        [
          <div class="flex items-center">
            <TokenIcon asset={data.fromAsset} size={18}></TokenIcon>
            <span class="ml-[4px]">
              {(
                data.fromAsset.value?.displaySymbol ||
                data.fromAsset.value?.symbol ||
                ""
              ).toUpperCase()}
            </span>
          </div>,
          <span class="font-mono">{data.fromAmount.value}</span>,
        ],
        [
          <div class="flex items-center">
            <TokenIcon asset={data.toAsset} size={18}></TokenIcon>
            <span class="ml-[4px]">{data.toSymbol.value?.toUpperCase()}</span>
          </div>,
          <span class="font-mono">{data.toAmount.value}</span>,
        ],
        [
          <span>
            <span class="uppercase">
              {(
                data.fromAsset.value?.displaySymbol ||
                data.fromAsset.value?.symbol ||
                ""
              ).toUpperCase()}
            </span>{" "}
            per{" "}
            <span class="uppercase">
              {(
                data.toAsset.value?.displaySymbol ||
                data.toAsset.value?.symbol ||
                ""
              ).toUpperCase()}
            </span>
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
            network={Network.SIFCHAIN}
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
            <div class="bg-gray-base rounded-lg p-4">
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
            <Toggle
              label="Pool Equaly"
              active={data.symmetricalPooling.value}
              onChange={(_active) => {
                data.toggleAsyncPooling();
                data.handleTokenAFocused();
              }}
            />
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
          />
          <div class="my-[4px] flex justify-center">
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
          />
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
            details={{
              isError: !!data.riskFactorStatus.value,
              errorType: data.riskFactorStatus.value || undefined,
              label: (
                <div class="flex items-center justify-between">
                  <span>Est. prices after pooling & pool share</span>
                  {!!riskContent.value && (
                    <Tooltip
                      content={riskContent.value}
                      placement="top"
                      interactive
                      appendTo={() =>
                        document.querySelector("#portal-target") ||
                        document.body
                      }
                    >
                      <div class="cursor-pointer">
                        <AssetIcon
                          icon="interactive/warning"
                          class={[
                            "mr-[4px]",
                            {
                              danger: "text-danger-base",
                              warning: "text-danger-warning",
                              bad: "text-danger-bad",
                            }[data.riskFactorStatus.value || "danger"],
                          ]}
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
                    <span class="uppercase">
                      {data.fromAsset.value?.displaySymbol}
                    </span>{" "}
                    per{" "}
                    <span class="uppercase">
                      {data.toAsset.value?.displaySymbol}
                    </span>
                  </span>,
                  <div class="flex items-center gap-[4px] font-mono">
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
            }}
          />
          {(data.nextStepAllowed.value && !data.hasActiveSafetyLag.value && (
            <Button.CallToAction
              onClick={() => data.handleNextStepClicked()}
              class="mt-[10px]"
            >
              Add Liquidity
            </Button.CallToAction>
          )) || (
            <Button.CallToAction
              disabled={
                !data.nextStepAllowed.value || data.hasActiveSafetyLag.value
              }
              onClick={() => appWalletPicker.show()}
              class="mt-[10px]"
            >
              {data.hasActiveSafetyLag.value ? (
                <AssetIcon
                  size={22}
                  icon="interactive/anim-racetrack-spinner"
                ></AssetIcon>
              ) : (
                data.nextStepMessage.value
              )}
            </Button.CallToAction>
          )}
        </Modal>
      );
    };
  },
});
