import {
  ComponentInternalInstance,
  ComponentPublicInstance,
  ConcreteComponent,
  defineComponent,
  onDeactivated,
  ref,
  TransitionGroup,
  VNode,
} from "vue";
import NavIconVue from "@/componentsLegacy/NavSidePanel/NavIcon.vue";
import PageCard from "@/components/PageCard";
import {
  TokenInputGroup,
  SampleBoundChildComponent,
} from "./components/TokenInputGroup";
import { useSwapPageData } from "./useSwapPageData";
import { useCore } from "@/hooks/useCore";
import { IAsset } from "../../../../core/src";
import { SlippageTolerance } from "./components/SlippageTolerance";
import { SwapDetails } from "./components/SwapDetails";
import { useTokenIconUrl } from "@/hooks/useTokenIconUrl";
import AssetIcon from "@/componentsLegacy/utilities/AssetIcon";
import { Button } from "@/components/Button/Button";

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
    const core = useCore();
    console.log(data.fromSymbol.value, data.toSymbol.value);
    const swapIcon = ref<ComponentPublicInstance>();
    const isHoveringOverInvertButtonRef = ref(false);
    return () => (
      <PageCard heading="Swap" iconName="navigation/swap" class="w-[531px]">
        {/* <TransitionGroup name="flip-list"> */}
        <TokenInputGroup
          onSelectAsset={(asset) => {
            data.fromSymbol.value = asset.symbol;
          }}
          class="z-10 overflow-hidden mb-[-12px]"
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
          class="flex relative items-center justify-center w-full z-20 overflow-hidden"
        >
          <button
            // onMouseover={() => {
            //   console.log("m2");
            //   isHoveringOverInvertButtonRef.value = true;
            // }}
            // onMouseout={() => {
            //   console.log("m1");
            //   isHoveringOverInvertButtonRef.value = false;
            // }}
            class="origin-center actidve:rotate-180 transition-transform flex items-center relative bg-gray-base border-gray-input_outline py-[4px] px-[9px] box-content border-[1px] rounded-[10px]"
            key="button"
            onClick={async (e: MouseEvent) => {
              isHoveringOverInvertButtonRef.value = true;

              data.handleArrowClicked();
              const btn = e.currentTarget as HTMLButtonElement;
              const a = btn.animate(
                [
                  {
                    composite: "add",
                    transform: "rotate(180deg)",
                  },
                ],
                {
                  duration: 200,
                  iterations: 1,
                },
              );
              a.play();
              await a.finished;
              isHoveringOverInvertButtonRef.value = false;
              // data.mutations.invertPair();
            }}
          >
            <AssetIcon
              vectorRef={swapIcon}
              size={22}
              class=" text-accent-base"
              icon="navigation/swap"
            ></AssetIcon>
          </button>
        </div>

        <TokenInputGroup
          onSelectAsset={(asset) => {
            data.toSymbol.value = asset.symbol;
          }}
          class="z-10 overflow-hidden mt-[-12px] "
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
          formattedBalance={undefined}
        />
        {/* </TransitionGroup> */}
        <SlippageTolerance
          slippage={data.slippage.value}
          onUpdate={(v) => {
            data.slippage.value = v;
          }}
        ></SlippageTolerance>
        <SwapDetails
          asset={data.toAsset}
          price={data.priceMessage.value?.replace("per", "/")}
          priceImpact={(data.priceImpact.value ?? "") + "%"}
          liquidityProviderFee={data.providerFee.value ?? ""}
          minimumReceived={data.minimumReceived.value}
        ></SwapDetails>
        <Button.CTA class="mt-[10px]">
          <AssetIcon icon={"interactive/arrows-in"} class="mr-[4px]" /> Connect
          Wallet
        </Button.CTA>
      </PageCard>
    );
  },
});
