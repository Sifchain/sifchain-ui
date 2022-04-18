import { computed, defineComponent, ref } from "vue";
import clsx from "clsx";
import { useRouter } from "vue-router";
import { Asset, Network } from "@sifchain/sdk";

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
import { TokenInputGroup } from "@/views/SwapPage/components/TokenInputGroup";

import { useAddLiquidityData } from "./useAddLiquidityData";

export default defineComponent({
  setup(): () => JSX.Element {
    const data = useAddLiquidityData();

    const router = useRouter();
    const formattedFromTokenBalance = useFormattedTokenBalance(data.fromSymbol);

    data.handleTokenAFocused();

    const appWalletPicker = useAppWalletPicker();

    const transactionDetails = useTransactionDetails({
      tx: data.transactionStatus,
    });

    const handleClose = () => {
      router.push({ name: "Pool" });
    };

    const riskContent = computed(() => {
      switch (data.riskFactorStatus.value) {
        case "":
          return `
            Note, this asymmetric liquidity add will induce a slip adjustment on your share of the pool.
          `;
        case "bad":
        case "warning":
          return `
            WARNING, this asymmetric liquidity add will induce a significant
            slip adjustment on your share of the pool. Consider adding
            liquidity in smaller chunks (alternating between Rowan and the
            other token) to reduce the slip adjustment impact.
        `;
        case "danger":
          return `
            ATTENTION! ARE YOU SURE?  This asymmetric liquidity add will induce a VERY significant slip adjustment on your share of the pool. 
            STRONGLY consider adding liquidity in smaller chunks (alternating between Rowan and the other token) to reduce the slip adjustment impact.
          `;
      }
    });

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
          <span>Est. pool share</span>,
          <div class="flex items-center gap-[4px] font-mono">
            <div>{data.shareOfPoolPercent.value}</div>
          </div>,
        ],
      ],
    }));

    const targetAsset = computed(() => {
      return data.fromAsset.value?.symbol === "rowan"
        ? data.toAsset.value
        : data.fromAsset.value;
    });

    const modalHeadingAction = (
      <div class="flex justify-end md:min-w-[200px]">
        {targetAsset.value ? (
          <Tooltip
            content={
              <>
                You're adding liquidity to
                <span class="text-accent-base mx-1 font-medium">
                  {targetAsset.value.displaySymbol.toUpperCase()}'s
                </span>{" "}
                pool.
              </>
            }
          >
            <div class="flex items-center font-semibold">
              {targetAsset.value.displaySymbol.toUpperCase()}{" "}
              <span class="translate-x-1">
                <TokenIcon asset={ref(Asset("rowan"))} size={26} />
              </span>
              <span class="z-10 overflow-hidden rounded-full bg-black ring ring-black">
                <TokenIcon asset={targetAsset} size={26} />
              </span>
            </div>
          </Tooltip>
        ) : null}
      </div>
    );

    const riskDisclaimer = computed(() => {
      const warningClasses = {
        "": {
          border: "border-gray-500",
          icon: "text-slate-300",
        },
        bad: {
          border: "border-danger-bad",
          icon: "text-danger-bad",
        },
        warning: {
          border: "border-danger-warning",
          icon: "text-danger-warning",
        },
        danger: {
          border: "border-danger-base",
          icon: "text-danger-base",
        },
      };
      return riskContent.value ? (
        <div
          class={clsx(
            "relative my-2 rounded border p-4",
            warningClasses[data.riskFactorStatus.value].border,
          )}
        >
          <div class="absolute top-0 right-0 p-2">
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
                  class={[
                    "mr-[4px]",
                    warningClasses[data.riskFactorStatus.value].icon,
                  ]}
                  size={22}
                />
              </div>
            </Tooltip>
          </div>
          <p class={["pr-4 text-slate-300"]}>
            {riskContent.value} See documentation{" "}
            <a
              href="https://docs.sifchain.finance/using-the-website/web-ui-step-by-step/pool/sifchain-liquidity-pools#asymmetric-liquidity-pool"
              target="_blank"
              class="underline"
            >
              here
            </a>
          </p>
        </div>
      ) : null;
    });

    return () => {
      if (data.modalStatus.value === "processing") {
        return (
          <TransactionDetailsModal
            network={Network.SIFCHAIN}
            icon="interactive/plus"
            onClose={handleClose}
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
            onClose={handleClose}
            headingAction={modalHeadingAction}
          >
            <div class="bg-gray-base grid gap-4 rounded-lg p-4">
              <Form.Details details={detailsRef.value} />
              {riskDisclaimer.value}
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
          onClose={() => handleClose()}
          headingAction={modalHeadingAction}
        >
          <div class="grid gap-4">
            <TokenInputGroup
              shouldShowNumberInputOnLeft
              heading="Input"
              excludeSymbols={[data.fromSymbol.value]}
              asset={data.fromAsset.value}
              amount={data.fromAmount.value}
              formattedBalance={formattedFromTokenBalance.value}
              onSetToMaxAmount={data.handleFromMaxClicked}
              onBlur={data.handleBlur}
              onFocus={data.handleTokenAFocused}
              onInputAmount={(v) => {
                data.fromAmount.value = v;
              }}
              onSelectAsset={(asset) => {
                if (asset.symbol === "rowan") {
                  data.toSymbol.value = data.fromSymbol.value;
                  data.fromSymbol.value = "rowan";
                } else {
                  data.fromSymbol.value = asset.symbol;
                  data.toSymbol.value = "rowan";
                }
              }}
            />

            <div class="bg-gray-base grid gap-4 rounded-lg p-4">
              <Form.Details
                isError={!!data.riskFactorStatus.value}
                details={{
                  isError: !!data.riskFactorStatus.value,
                  errorType: data.riskFactorStatus.value || undefined,
                  label: <div></div>,
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
              {riskDisclaimer.value}
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
