import {
  AssetAmount,
  formatAssetAmount,
  IAsset,
  IAssetAmount,
  Network,
} from "@sifchain/sdk";
import { PoolShareEstimateRes } from "@sifchain/sdk/build/typescript/generated/proto/sifnode/clp/v1/querier";
import { formatDistance } from "date-fns";
import { computed, defineComponent, PropType, Ref, ref } from "vue";
import { useRouter } from "vue-router";

import AssetIcon from "~/components/AssetIcon";
import { Button } from "~/components/Button/Button";
import { Form, FormDetailsType } from "~/components/Form";
import Modal from "~/components/Modal";
import Toggle from "~/components/Toggle";
import { TokenIcon } from "~/components/TokenIcon";
import { Tooltip } from "~/components/Tooltip";
import TransactionDetailsModal from "~/components/TransactionDetailsModal";
import { usePoolshareEstimateQuery } from "~/domains/clp/queries/liquidityProvider";
import { useCurrentRewardPeriodStatistics } from "~/domains/clp/queries/params";
import { useMarginEnabledPoolsQuery } from "~/domains/margin/queries/params";
import { useAppWalletPicker } from "~/hooks/useAppWalletPicker";
import { useFormattedTokenBalance } from "~/hooks/useFormattedTokenBalance";
import { useTransactionDetails } from "~/hooks/useTransactionDetails";
import { flagsStore } from "~/store/modules/flags";
import { prettyNumber } from "~/utils/prettyNumber";
import { usePoolPageData } from "~/views/PoolPage/usePoolPageData";
import {
  AssetPairFieldSet,
  AssetPairRow,
} from "~/views/SwapPage/children/ConfirmSwap";
import { TokenInputGroup } from "~/views/SwapPage/components/TokenInputGroup";
import AssetPair from "./AssetPair";
import RiskWarning from "./RiskWarning";
import SettingsDropdown from "./SettingsDropdown";
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

    const poolPageData = usePoolPageData();

    const pool = computed(() =>
      poolPageData.allPoolsData.value.find(
        (x) => x.poolStat.symbol === data.fromSymbol.value,
      ),
    );

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

      if (!pool.value) {
        return defaultPrices;
      }

      const { pool: currentPool, poolStat } = pool.value;

      const nativeBalance = currentPool.nativeAmount.toDerived().toNumber();

      const nativeTVL = nativeBalance * (poolStat.rowanUSD ?? 0);

      const externalBalance = currentPool.externalAmount.toDerived().toNumber();

      const externalTVL = externalBalance * (poolStat.priceToken ?? 0);

      const poolTVL = nativeTVL + externalTVL;

      if (!poolTVL) {
        return defaultPrices;
      }

      const baseRatio = poolTVL / 100;

      return {
        externalTVL: externalTVL,
        nativeTVL: nativeTVL,
        tvlUsd: poolTVL,
        nativeRatio: nativeTVL / baseRatio, // e.g: 50%
        externalRatio: externalTVL / baseRatio, // e.g: 50%
        externalPrice: poolStat.priceToken ?? 0,
        nativePrice: poolStat.rowanUSD ?? 0,
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
      ],
    }));

    const { data: rewardsPeriod } = useCurrentRewardPeriodStatistics();

    const { data: marginEnabledPools } = useMarginEnabledPoolsQuery();

    const isMarginEnabledPool = computed(() => {
      if (!marginEnabledPools.value) {
        return false;
      }

      return marginEnabledPools.value.some(
        (token) =>
          token.displaySymbol.toLowerCase() ===
            data.fromSymbol.value.toLowerCase() ||
          token.baseDenom === data.fromSymbol.value,
      );
    });

    const hasUnbondingPeriod = computed(
      () => Number(rewardsPeriod.value?.estimatedLockMs ?? 0) > 0,
    );

    const isAsymmetricPoolingEnabled = computed(
      () => flagsStore.state.remoteFlags.ASYMMETRIC_POOLING,
    );

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
        const externalAssetDenomOrSymbol = computed(
          () =>
            data.fromAsset.value?.ibcDenom ??
            data.fromAsset.value?.symbol ??
            "",
        );
        const externalAssetSymbol = computed(
          () => data.fromAsset.value?.symbol ?? "",
        );

        const { data: poolShareQuote, error } = usePoolshareEstimateQuery({
          nativeAssetAmount: computed(
            () =>
              data.tokenBField.value.fieldAmount ?? AssetAmount("rowan", "0"),
          ),
          externalAssetAmount: computed(
            () =>
              data.tokenAField.value.fieldAmount ?? AssetAmount("rowan", "0"),
          ),
          externalAssetDenomOrSymbol,
        });

        const quote = computed((): PoolShareEstimateRes => {
          if (error.value || !poolShareQuote.value) {
            return {
              nativeAssetAmount: "0",
              externalAssetAmount: "0",
              percentage: "0",
            };
          }

          return poolShareQuote.value;
        });

        const poolShare = computed(() =>
          AssetAmount("rowan", quote.value.percentage).toDerived().toNumber(),
        );

        const nativeAmount = computed(() =>
          AssetAmount("rowan", quote.value.nativeAssetAmount),
        );

        const externalAmount = computed(() =>
          AssetAmount(
            externalAssetSymbol.value,
            quote.value.externalAssetAmount,
          ),
        );

        const enhancedDetailsRef = computed(() => {
          const estimatedPoolShareField = [
            <span>Est. pool share</span>,
            <div class="flex items-center gap-[4px] font-mono">
              <div>
                {poolShare.value.toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                  style: "percent",
                })}
              </div>
            </div>,
          ];

          const isBuyingRowan =
            quote.value.swapInfo?.status === 3; /* SwapStatus.BUY_NATIVE */

          return {
            details: data.symmetricalPooling.value
              ? [
                  [
                    <div class="flex items-center">
                      <TokenIcon asset={data.fromAsset} size={18} />
                      <span class="ml-[4px]">{fromTokenLabel.value}</span>
                    </div>,
                    <div class="text-right">
                      <div class="font-mono">
                        {formatAssetAmount(externalAmount.value)}
                      </div>
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
                      <div class="font-mono">
                        {formatAssetAmount(nativeAmount.value)}
                      </div>
                      <div class="font-mono text-sm text-white/60">
                        ≈${prettyNumber(toTokenPriceUSD.value)}
                      </div>
                    </div>,
                  ],
                  estimatedPoolShareField,
                ]
              : [
                  [
                    <div class="flex items-center">
                      Liquidity Provider Fee (
                      {AssetAmount(
                        "rowan",
                        quote.value.swapInfo?.feeRate ?? "0",
                      )
                        .toDerived()
                        .toNumber()
                        .toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                          style: "percent",
                        })}
                      )
                    </div>,
                    <div class="text-right">
                      <div class="flex items-center gap-2 font-mono">
                        {formatAssetAmount(
                          AssetAmount(
                            isBuyingRowan ? "rowan" : externalAssetSymbol.value,
                            quote.value.swapInfo?.fee ?? "0",
                          ),
                        )}

                        <TokenIcon
                          asset={isBuyingRowan ? data.toAsset : data.fromAsset}
                          size={18}
                        />
                      </div>
                    </div>,
                  ],
                  estimatedPoolShareField,
                ],
          } as FormDetailsType;
        });

        const estimatedExternalUSD = computed(() => {
          return (
            poolComposition.value.externalPrice *
            externalAmount.value.toDerived().toNumber()
          );
        });

        const estimatedNativeUSD = computed(() => {
          return (
            poolComposition.value.nativePrice *
            nativeAmount.value.toDerived().toNumber()
          );
        });

        return (
          <Modal
            heading="Add Liquidity"
            icon="interactive/plus"
            showClose={true}
            onClose={close}
            headingAction={
              <div class="flex justify-end md:min-w-[200px]">
                <AssetPair hideTokenSymbol={true} asset={data.fromAsset} />
              </div>
            }
          >
            <div class="grid gap-4">
              {!data.symmetricalPooling.value && (
                <>
                  <TokenGroupCard
                    label="User added"
                    asset1={computed(
                      () =>
                        data.tokenAField.value.fieldAmount ??
                        AssetAmount("rowan", "0"),
                    )}
                    asset2={computed(
                      () =>
                        data.tokenBField.value.fieldAmount ??
                        AssetAmount("rowan", "0"),
                    )}
                    asset1Price={fromTokenPriceUSD}
                    asset2Price={toTokenPriceUSD}
                  />
                  <TokenGroupCard
                    label="Amount pooled after swap"
                    asset1={externalAmount}
                    asset2={nativeAmount}
                    asset1Price={estimatedExternalUSD}
                    asset2Price={estimatedNativeUSD}
                  />
                </>
              )}
              <div class="bg-gray-base grid gap-2 rounded-lg p-4">
                <Form.Details details={enhancedDetailsRef.value} />
                <RiskWarning
                  isSlippagePossible={!data.symmetricalPooling.value}
                  riskFactorStatus={data.riskFactorStatus}
                  isMarginEnabledPool={isMarginEnabledPool.value}
                />
              </div>
              {hasUnbondingPeriod.value && (
                <div class="flex items-center justify-between overflow-hidden rounded border border-gray-500 p-4">
                  <span class="flex items-center text-slate-300">
                    Once added, all liquidity will be subject to a{" "}
                    {formatDistance(
                      0,
                      rewardsPeriod.value?.estimatedLockMs ?? 0,
                    )}{" "}
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
              )}
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
          showClose={true}
          headingAction={
            <div class="flex items-center justify-between gap-2">
              <Tooltip
                content={
                  data.symmetricalPooling.value ? (
                    <>
                      You will pool in equal amounts based on this composition
                      ratio. Your liquidity position is more impacted by price
                      movements of the token that makes up the larger portion of
                      the composition.
                    </>
                  ) : undefined
                }
              >
                <div class="flex items-center justify-center gap-2">
                  <AssetPair hideTokenSymbol={true} asset={data.fromAsset} />
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
              {isAsymmetricPoolingEnabled.value && (
                <SettingsDropdown
                  items={[
                    {
                      label: "Toggle Asymmetric pooling",
                      content: (
                        <>
                          <Toggle
                            active={!data.symmetricalPooling.value}
                            onChange={() => {}}
                          />
                          <span>Asymmetric pooling</span>
                        </>
                      ),
                      onClick: () => {
                        data.toggleSymmetricPooling();
                      },
                    },
                  ]}
                />
              )}
            </div>
          }
          onClose={close}
        >
          <div class="grid gap-4">
            <div>
              <TokenInputGroup
                shouldShowNumberInputOnLeft={true}
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
                selectDisabled={true}
                shouldShowNumberInputOnLeft={true}
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
                  details: [],
                }}
              />
              <RiskWarning
                isSlippagePossible={!data.symmetricalPooling.value}
                riskFactorStatus={data.riskFactorStatus}
                isMarginEnabledPool={isMarginEnabledPool.value}
              />
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

export const TokenGroupCard = defineComponent({
  name: "TokenGroupCard",
  props: {
    label: {
      type: String,
      required: true,
    },
    asset1: {
      type: Object as PropType<Ref<IAssetAmount>>,
      required: true,
    },
    asset1Price: {
      type: Object as PropType<Ref<number>>,
      required: true,
    },
    asset2: {
      type: Object as PropType<Ref<IAssetAmount>>,
      required: true,
    },
    asset2Price: {
      type: Object as PropType<Ref<number>>,
      required: true,
    },
  },
  setup(props) {
    return () => (
      <section class="bg-gray-base grid gap-4 rounded-lg p-4">
        <h3 class="text-md text-white/80">{props.label}</h3>
        <AssetPairRow
          assetAmount={props.asset1}
          assetPrice={props.asset1Price}
        />
        <AssetPairRow
          assetAmount={props.asset2}
          assetPrice={props.asset2Price}
        />
      </section>
    );
  },
});
