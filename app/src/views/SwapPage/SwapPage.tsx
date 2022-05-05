import {
  ComponentPublicInstance,
  defineComponent,
  onMounted,
  ref,
  watch,
} from "vue";
import { RouterView, useRouter } from "vue-router";

import { useCore } from "@/hooks/useCore";
import { useAppWalletPicker } from "@/hooks/useAppWalletPicker";
import { usePublicPoolsSubscriber } from "@/hooks/usePoolsSubscriber";

import PageCard from "@/components/PageCard";
import Layout from "@/components/Layout";
import AssetIcon from "@/components/AssetIcon";
import Button from "@/components/Button";

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
        <PageCard breadCrumbs={["Swap"]}>
          <div class="bg-gray-sif750 mx-auto grid max-w-lg gap-4 p-4 md:rounded-xl">
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
                class="relative z-10 flex w-full items-center justify-center overflow-hidden"
              >
                <button
                  class={`
                    actidve:rotate-180 bg-gray-base border-gray-input_outline hover:border-accent-base 
                    relative box-content flex origin-center items-center rounded-lg border py-1 px-2
                  `}
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
              priceImpact={(data.priceImpact.value ?? "") + "%"}
              liquidityProviderFee={data.providerFee.value ?? ""}
              minimumReceived={data.minimumReceived.value}
            />
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
