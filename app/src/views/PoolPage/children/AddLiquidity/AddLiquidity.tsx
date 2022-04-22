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
import Toggle from "@/components/Toggle";
import { TokenInputGroup } from "@/views/SwapPage/components/TokenInputGroup";

import { useAddLiquidityData } from "./useAddLiquidityData";
import AssetPair from "./AssetPair";
import RiskWarning from "./RiskWarning";

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

    const detailsRef = computed<FormDetailsType>(() => ({
      details: [
        [
          <div class="flex items-center">
            <TokenIcon asset={data.fromAsset} size={18} />
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
            <TokenIcon asset={data.toAsset} size={18} />
            <span class="ml-[4px]">
              {(
                data.toAsset.value?.displaySymbol ||
                data.toAsset.value?.symbol ||
                ""
              ).toUpperCase()}
            </span>
          </div>,
          <span class="font-mono">{data.toAmount.value}</span>,
        ],
        [
          <span>Est. pool share</span>,
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
            headingAction={
              <div class="flex justify-end md:min-w-[200px]">
                <AssetPair hideTokenSymbol asset={data.fromAsset} />
              </div>
            }
          >
            <div class="bg-gray-base grid gap-4 rounded-lg p-4">
              <Form.Details details={detailsRef.value} />
              {!data.symmetricalPooling.value && (
                <RiskWarning riskFactorStatus={data.riskFactorStatus} />
              )}
            </div>
            <Button.CallToAction
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
            <div class="flex items-center gap-2">
              <Toggle
                label="Pool Equal Ratios"
                active={data.symmetricalPooling.value}
                onChange={(_active) => {
                  data.toggleAsyncPooling();
                  data.handleTokenAFocused();
                }}
              />
              <AssetPair hideTokenSymbol asset={data.fromAsset} />
            </div>
          }
          onClose={() => close()}
        >
          <div class="grid gap-4">
            <div>
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
                <AssetIcon
                  size={20}
                  class="text-white"
                  icon="interactive/plus"
                />
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
            </div>
            <div class="bg-gray-base grid gap-4 rounded-lg p-4">
              <Form.Details
                details={{
                  label: "",
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
              />
              <Form.Details
                isError={!!data.riskFactorStatus.value}
                details={{
                  isError: !!data.riskFactorStatus.value,
                  errorType: data.riskFactorStatus.value || undefined,
                  label: "",
                  details: [
                    [
                      <span>Est. pool share</span>,
                      <div class="flex items-center gap-[4px] font-mono">
                        <div>{data.shareOfPoolPercent.value}</div>
                      </div>,
                    ],
                  ],
                }}
              />
              {!data.symmetricalPooling.value && (
                <RiskWarning riskFactorStatus={data.riskFactorStatus} />
              )}
            </div>
            {(data.nextStepAllowed.value && !data.hasActiveSafetyLag.value && (
              <Button.CallToAction onClick={() => data.handleNextStepClicked()}>
                Add Liquidity
              </Button.CallToAction>
            )) || (
              <Button.CallToAction
                disabled={
                  !data.nextStepAllowed.value || data.hasActiveSafetyLag.value
                }
                onClick={() => appWalletPicker.show()}
              >
                {data.hasActiveSafetyLag.value ? (
                  <AssetIcon
                    size={22}
                    icon="interactive/anim-racetrack-spinner"
                  />
                ) : (
                  data.nextStepMessage.value
                )}
              </Button.CallToAction>
            )}
          </div>
        </Modal>
      );
    };
  },
});
