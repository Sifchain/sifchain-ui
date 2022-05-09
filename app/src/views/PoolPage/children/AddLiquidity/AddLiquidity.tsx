import { computed, defineComponent } from "vue";
import { useRouter } from "vue-router";
import { formatDistance } from "date-fns";
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
import { TokenInputGroup } from "@/views/SwapPage/components/TokenInputGroup";
import { useCurrentRewardPeriodStatistics } from "@/domains/clp/queries/params";
import { prettyNumber } from "@/utils/prettyNumber";

import { useAddLiquidityData } from "./useAddLiquidityData";
import AssetPair from "./AssetPair";
import RiskWarning from "./RiskWarning";
import { usePoolPageData } from "../../usePoolPageData";

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

    const poolPageData = usePoolPageData();

    const poolComposition = computed(() => {
      const defaultPrices = {
        nativeTVL: 0,
        nativePrice: 0,
        nativeRatio: 0,
        externalTVL: 0,
        externalPrice: 0,
        externalRatio: 0,
        tvlUsd: 0,
      };

      if (!poolPageData.allPoolsData.value) {
        return defaultPrices;
      }

      const pool = poolPageData.allPoolsData.value.find(
        (x) => x.poolStat.symbol === data.fromSymbol.value,
      );

      if (!pool) {
        return defaultPrices;
      }

      const poolTVL = pool.poolStat.poolTVL;

      const externalTVL = pool.pool.externalAmount
        .toDerived()
        .multiply(pool.poolStat.priceToken ?? "0")
        .toNumber();

      const nativeTVL = poolTVL - externalTVL;
      const baseRatio = poolTVL / 100;

      return {
        externalTVL,
        nativeTVL,
        tvlUsd: poolTVL,
        nativeRatio: nativeTVL / baseRatio,
        externalRatio: externalTVL / baseRatio,
        externalPrice: pool.poolStat.priceToken ?? 0,
        nativePrice: pool.poolStat.rowanUSD ?? 0,
      };
    });

    const fromTokenPriceUSD = computed(
      () => Number(data.fromAmount.value) * poolComposition.value.externalPrice,
    );
    const toTokenPriceUSD = computed(
      () => Number(data.toAmount.value) * poolComposition.value.nativePrice,
    );

    const fromTokenLabel = computed(() =>
      (
        data.fromAsset.value?.displaySymbol ??
        data.fromAsset.value?.symbol ??
        ""
      ).toUpperCase(),
    );
    const toTokenLabel = computed(() =>
      (
        data.toAsset.value?.displaySymbol ??
        data.toAsset.value?.symbol ??
        ""
      ).toUpperCase(),
    );

    const detailsRef = computed<FormDetailsType>(() => ({
      details: [
        [
          <div class="flex items-center">
            <TokenIcon asset={data.fromAsset} size={18} />
            <span class="ml-[4px]">{fromTokenLabel.value}</span>
          </div>,
          <div class="text-right">
            <div class="font-mono">{data.fromAmount.value}</div>
            <div class="font-mono text-sm text-white/60">
              ≈${prettyNumber(fromTokenPriceUSD.value)}
            </div>
          </div>,
        ],
        [
          <div class="flex items-center">
            <TokenIcon asset={data.toAsset} size={18} />
            <span class="ml-[4px]">{toTokenLabel.value}</span>
          </div>,
          <div class="text-right">
            <div class="font-mono">{data.toAmount.value}</div>
            <div class="font-mono text-sm text-white/60">
              ≈${prettyNumber(toTokenPriceUSD.value)}
            </div>
          </div>,
        ],
        [
          <span>Est. pool share</span>,
          <div class="flex items-center gap-[4px] font-mono">
            <div>{data.shareOfPoolPercent.value}</div>
          </div>,
        ],
      ],
    }));

    const { data: rewardsPeriod } = useCurrentRewardPeriodStatistics();

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
            <div class="grid gap-4">
              <div class="bg-gray-base grid gap-4 rounded-lg p-4">
                <Form.Details details={detailsRef.value} />
                {!data.symmetricalPooling.value && (
                  <RiskWarning riskFactorStatus={data.riskFactorStatus} />
                )}
              </div>
              <div class="flex items-center justify-between overflow-hidden rounded border border-gray-500 p-4">
                <span class="flex items-center text-slate-300">
                  Once added, all liquidity will be subject to a{" "}
                  {formatDistance(0, rewardsPeriod.value?.estimatedLockMs ?? 0)}{" "}
                  unbonding period. Once your funds are ready, you will have{" "}
                  {rewardsPeriod.value?.estimatedCancelMs === undefined
                    ? "..."
                    : formatDistance(
                        0,
                        rewardsPeriod.value?.estimatedCancelMs,
                      )}{" "}
                  to remove them before the request is canceled. Please check
                  back periodically to ensure you don't miss your window!
                </span>
                <div>
                  <AssetIcon
                    icon="interactive/warning"
                    class="text-slate-300"
                    size={22}
                  />
                </div>
              </div>
              <Button.CallToAction
                onClick={() => {
                  data.handleAskConfirmClicked();
                }}
              >
                Confirm
              </Button.CallToAction>
            </div>
          </Modal>
        );
      }

      return (
        <Modal
          heading="Add Liquidity"
          icon="interactive/plus"
          showClose
          headingAction={
            <Tooltip
              content={
                <>
                  You will pool in equal amounts based on this composition
                  ratio. Your liquidity position is more impacted by price
                  movements of the token that makes up the larger portion of the
                  composition.
                </>
              }
            >
              <div class="flex items-center justify-center gap-2">
                <AssetPair hideTokenSymbol asset={data.fromAsset} />
                <div class="grid gap-0.5">
                  <div class="text-accent-base/80 text-sm !font-semibold">
                    Pool composition
                  </div>
                  <span class="text-xs">
                    {data.fromAsset.value?.displaySymbol.toUpperCase()}{" "}
                    {poolComposition.value.externalRatio.toFixed(2)}% :{" "}
                    {data.toAsset.value?.displaySymbol.toUpperCase()}{" "}
                    {poolComposition.value.nativeRatio.toFixed(2)}%
                  </span>
                </div>
              </div>
            </Tooltip>
          }
          onClose={() => close()}
        >
          <div class="grid gap-4">
            <div>
              <TokenInputGroup
                shouldShowNumberInputOnLeft
                excludeSymbols={["rowan"]}
                heading={fromTokenLabel.value}
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
                  data.fromSymbol.value = asset.symbol;
                }}
                dollarValue={fromTokenPriceUSD.value}
                class="relative"
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
                heading={toTokenLabel.value}
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
                dollarValue={toTokenPriceUSD.value}
              />
            </div>
            <div class="bg-gray-base grid gap-4 rounded-lg p-4">
              <Form.Details
                details={{
                  label: (
                    <div class="flex flex-1 items-center justify-between">
                      <span class="text-accent-base/80 font-semibold">
                        Pool composition
                      </span>
                      <span class="text-white/60">
                        {poolComposition.value.tvlUsd
                          ? `$${prettyNumber(
                              poolComposition.value.tvlUsd,
                            )} TVL `
                          : "..."}
                      </span>
                    </div>
                  ),
                  details: [
                    [
                      <>{fromTokenLabel.value}</>,
                      <>
                        {poolComposition.value.externalTVL
                          ? `$${prettyNumber(
                              poolComposition.value.externalTVL,
                            )}`
                          : "0"}{" "}
                        ({poolComposition.value.externalRatio.toFixed(2)}%)
                      </>,
                    ],
                    [
                      <>{toTokenLabel.value}</>,
                      <>
                        {poolComposition.value.nativeTVL
                          ? `$${prettyNumber(poolComposition.value.nativeTVL)}`
                          : "0"}{" "}
                        ({poolComposition.value.nativeRatio.toFixed(2)}%)
                      </>,
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
