import {
  ComponentPublicInstance,
  defineComponent,
  onMounted,
  ref,
  watch,
} from "vue";
import PageCard from "@/components/PageCard";
import { TokenInputGroup } from "./components/TokenInputGroup";
import { useSwapPageData } from "./useSwapPageData";
import Layout from "@/componentsLegacy/Layout/Layout";
import { SlippageTolerance } from "./components/SlippageTolerance";
import { SwapDetails } from "./components/SwapDetails";
import AssetIcon from "@/components/AssetIcon";
import { Button } from "@/components/Button/Button";
import { useAppWalletPicker } from "@/hooks/useAppWalletPicker";
import { RouterView, useRouter } from "vue-router";
import { usePublicPoolsSubscriber } from "@/hooks/usePoolsSubscriber";
import { useCore } from "@/hooks/useCore";

// This is a little generic but these UI Flows
// might be different depending on our page functionality
// It would be better not to share them but instead derive state based on them in this file/domain.
// Currently some of these are used in down tree components but until we convert to JSX
// We will need to manage these manually

export default defineComponent({
  name: "SwapPage",
  props: {},
  setup() {
    // const data = useSwapPageModule();
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
        <PageCard heading="Swap" iconName="navigation/swap" class="w-[531px]">
          {/* <TransitionGroup name="flip-list"> */}
          <TokenInputGroup
            onSelectAsset={(asset) => {
              data.fromSymbol.value = asset.symbol;
            }}
            class="overflow-hidden mb-[-12px]"
            tokenIconUrl={data.fromTokenIconUrl.value ?? ""}
            onFocus={() => data.handleFromFocused()}
            onBlur={() => data.handleBlur()}
            heading="From"
            // key={data.fromSymbol.value}
            onSetToMaxAmount={() => {
              data.handleFromMaxClicked();
            }}
            onInputAmount={(val) => {
              data.fromAmount.value = val;
            }}
            amount={data.fromAmount.value}
            asset={data.fromAsset.value}
            formattedBalance={data.formattedFromTokenBalance.value || undefined}
          />
          <div
            key="button"
            class="flex relative items-center justify-center w-full overflow-hidden"
          >
            <button
              // onMouseover={() => {
              //   console.log("m2");
              // }}
              // onMouseout={() => {
              //   console.log("m1");
              //   isHoveringOverInvertButtonRef.value = false;
              // }}
              class="origin-center actidve:rotate-180 flex items-center relative bg-gray-base border-gray-input_outline py-[4px] px-[9px] box-content border-[1px] rounded-[10px] hover:border-accent-base"
              key="button"
              onClick={async (e: MouseEvent) => {
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
                  class=" text-accent-base"
                  icon="navigation/swap"
                ></AssetIcon>
              </div>
            </button>
          </div>

          <TokenInputGroup
            onSelectAsset={(asset) => {
              data.toSymbol.value = asset.symbol;
            }}
            class="overflow-hidden mt-[-12px] "
            tokenIconUrl={data.toTokenIconUrl.value ?? ""}
            onFocus={() => data.handleToFocused()}
            onBlur={() => data.handleBlur()}
            heading="To"
            // key={data.toSymbol.value}
            // key={data.modules.fromTokenInputGroup.state.symbol}
            onInputAmount={(val) => {
              data.toAmount.value = val;
            }}
            amount={data.toAmount.value}
            asset={data.toAsset.value}
            formattedBalance={data.formattedToTokenBalance.value || undefined}
          />
          {/* </TransitionGroup> */}
          <SlippageTolerance
            slippage={data.slippage.value}
            onUpdate={(v) => {
              data.slippage.value = v;
            }}
          ></SlippageTolerance>
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
            class="mt-[10px]"
          >
            {data.nextStepMessage.value}
          </Button.CallToAction>
          <RouterView></RouterView>
          <div class="pb-4" />
        </PageCard>
      </Layout>
    );
  },
});
