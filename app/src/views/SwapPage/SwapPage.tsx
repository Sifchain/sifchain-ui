import {
  ComponentPublicInstance,
  defineComponent,
  onMounted,
  ref,
  watch,
} from "vue";
import { RouterView, useRouter } from "vue-router";

import { useCore } from "~/hooks/useCore";
import { useAppWalletPicker } from "~/hooks/useAppWalletPicker";
import { usePublicPoolsSubscriber } from "~/hooks/usePoolsSubscriber";

import PageCard from "~/components/PageCard";
import Layout from "~/components/Layout";
import AssetIcon from "~/components/AssetIcon";
import Button from "~/components/Button";

import { SwapDetails } from "./components/SwapDetails";
import { SlippageTolerance } from "./components/SlippageTolerance";
import { TokenInputGroup } from "./components/TokenInputGroup";
import { useSwapPageData } from "./useSwapPageData";

export default defineComponent({
  name: "SwapPage",
  setup() {
    const data = useSwapPageData();
    const swapIcon = ref<ComponentPublicInstance>();
    const appWalletPicker = useAppWalletPicker();
    const router = useRouter();
    const isInverted = ref(false);

    // While swap page is open, ensure pools update
    // pretty frequently so prices stay up to date...
    usePublicPoolsSubscriber({
      delay: ref(10 * 1000),
    });

    onMounted(() => {
      useCore().usecases.clp.syncPools.syncPublicPools();
      data.fromAmount.value = data.toAmount.value = "0";
    });

    watch([data.pageState], () => {
      switch (data.pageState.value) {
        case "idle": {
          return router.push({});
        }
      }
    });

    return () => (
      <Layout>
        <PageCard heading="Swap" iconName="navigation/swap">
          <div class="grid gap-4">
            <div class="grid gap-2">
              <TokenInputGroup
                onSelectAsset={(asset) => {
                  data.fromSymbol.value = asset.symbol;
                }}
                class="-mb-4 overflow-hidden"
                tokenIconUrl={data.fromTokenIconUrl.value ?? ""}
                onFocus={() => data.handleFromFocused()}
                onBlur={() => data.handleBlur()}
                heading="From"
                onSetToMaxAmount={() => {
                  data.handleFromMaxClicked();
                }}
                onInputAmount={(val) => {
                  data.fromAmount.value = val;
                }}
                amount={data.fromAmount.value}
                asset={data.fromAsset.value}
                formattedBalance={
                  data.formattedFromTokenBalance.value || undefined
                }
              />
              <div
                key="button"
                class="relative z-10 flex w-full scale-125 items-center justify-center overflow-hidden"
              >
                <button
                  class="actidve:rotate-180 bg-gray-base border-gray-input_outline hover:border-accent-base relative box-content flex origin-center items-center rounded-[10px] border-[1px] py-[4px] px-[9px]"
                  key="button"
                  onClick={() => {
                    data.handleArrowClicked();
                    isInverted.value = !isInverted.value;
                  }}
                >
                  <div
                    style={{
                      transform: `scaleY(${isInverted.value ? -1 : 1})`,
                    }}
                  >
                    <AssetIcon
                      vectorRef={swapIcon}
                      size={22}
                      class="text-accent-base"
                      icon="navigation/swap"
                    />
                  </div>
                </button>
              </div>
              <TokenInputGroup
                onSelectAsset={(asset) => {
                  data.toSymbol.value = asset.symbol;
                  data.toAmount.value = "0";
                  data.fromAmount.value = "0";
                }}
                class="-mt-4 overflow-hidden"
                tokenIconUrl={data.toTokenIconUrl.value ?? ""}
                onFocus={data.handleToFocused}
                onBlur={data.handleBlur}
                heading="To"
                onInputAmount={(val) => {
                  data.toAmount.value = val;
                }}
                amount={data.toAmount.value}
                asset={data.toAsset.value}
                formattedBalance={
                  data.formattedToTokenBalance.value || undefined
                }
              />
            </div>
            <SlippageTolerance
              slippage={data.slippage.value || "0"}
              onUpdate={(v) => {
                data.slippage.value = v || "0";
              }}
            />
            <SwapDetails
              fromAsset={data.fromAsset}
              toAsset={data.toAsset}
              priceRatio={data.priceRatio}
              priceImpact={`${data.priceImpact.value}%`}
              liquidityProviderFee={data.providerFee.value ?? ""}
              minimumReceived={data.minimumReceived.value}
              swapFeeRate={data.swapFeeRate.value}
            />
            {data.fromAsset.value.symbol === "rowan" && (
              <section
                role="alert"
                class="border-danger-base text-danger-base rounded-md border p-2 text-center text-sm"
              >
                The current max swap amount is{" "}
                <span class="font-bold">
                  {data.formattedCurrentLiquidityThreshold.value} ROWAN
                </span>
                . This value updates every block (~6 seconds).
              </section>
            )}
            <Button.CallToAction
              onClick={() => {
                if (!data.nextStepAllowed.value) {
                  return appWalletPicker.show();
                }
                data.handleNextStepClicked();
              }}
              disabled={!data.nextStepAllowed.value}
            >
              {data.nextStepMessage.value}
            </Button.CallToAction>
            <RouterView />
          </div>
        </PageCard>
      </Layout>
    );
  },
});
