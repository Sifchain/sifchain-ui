import { defineComponent, onDeactivated, TransitionGroup } from "vue";
import NavIconVue from "@/componentsLegacy/NavSidePanel/NavIcon.vue";
import PageCard from "@/components/PageCard";
import { useSwapPageModule } from "./useSwapPageModule";
import { TokenInputGroup } from "./components/TokenInputGroup";
import { useSwapPageData } from "./useSwapPageData";
import { useCore } from "@/hooks/useCore";
import { IAsset } from "../../../../core/src";
import { SlippageTolerance } from "./components/SlippageTolerance";
import { SwapDetails } from "./components/SwapDetails";
import { useTokenIconUrl } from "@/hooks/useTokenIconUrl";

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

    return () => (
      <PageCard heading="Swap" iconName="navigation/swap">
        <TransitionGroup name="flip-list">
          <TokenInputGroup
            tokenIconUrl={data.fromTokenIconUrl.value ?? ""}
            onFocus={() => data.handleFromFocused()}
            onBlur={() => data.handleBlur()}
            heading="From"
            key={data.fromSymbol.value}
            onSetToMaxAmount={() => {
              data.handleFromMaxClicked();
            }}
            onInputAmount={(val) => {
              data.fromAmount.value = val;
            }}
            amount={data.fromAmount.value}
            asset={
              core.config.assets.find(
                (asset) =>
                  asset.symbol == data.fromSymbol.value ||
                  asset.symbol == `c${data.fromSymbol.value}`,
              ) as IAsset
            }
            formattedBalance={data.formattedFromTokenBalance.value || undefined}
          />
          <button
            class="relative z-10 overflow-hidden"
            key="button"
            onClick={() => {
              data.handleArrowClicked();
              // data.mutations.invertPair();
            }}
          >
            <img
              class="mt-[10px] p-[20px] bg-accent-gradient rounded-[4px]"
              src={require("@/assets/icons/interactive/swap.svg")}
            />
          </button>

          <TokenInputGroup
            tokenIconUrl={data.toTokenIconUrl.value ?? ""}
            onFocus={() => data.handleToFocused()}
            onBlur={() => data.handleBlur()}
            heading="To"
            key={data.toSymbol.value}
            // key={data.modules.fromTokenInputGroup.state.symbol}
            onInputAmount={(val) => {
              data.toAmount.value = val;
              // data.mutations.updateActiveFieldType("from");
              // data.modules.fromTokenInputGroup.mutations.updateAmount(val);
            }}
            amount={data.toAmount.value}
            asset={
              core.config.assets.find(
                (asset) =>
                  asset.symbol == data.toSymbol.value ||
                  asset.symbol == `c${data.toSymbol.value}`,
              ) || (core.config.assets[0] as IAsset)
            }
            formattedBalance={undefined}
          />
        </TransitionGroup>
        <SlippageTolerance
          slippage={data.slippage.value}
          onUpdate={(v) => {
            data.slippage.value = v;
          }}
        ></SlippageTolerance>
        <SwapDetails
          price={data.priceMessage.value?.replace("per", "/")}
          toTokenImageUrl={data.toTokenIconUrl.value ?? ""}
          priceImpact={(data.priceImpact.value ?? "") + "%"}
          liquidityProviderFee={data.providerFee.value ?? ""}
          minimumReceived={data.minimumReceived.value}
        ></SwapDetails>
        <button class="mt-[10px] w-full h-[62px] rounded-[4px] bg-accent-gradient flex items-center justify-center font-sans text-[18px] font-semibold text-white">
          <img
            src={require("@/assets/icons/interactive/arrows-in.svg")}
            class="w-[20px] h-[20px] mr-[4px]"
          />{" "}
          Connect Wallet
        </button>
      </PageCard>
    );
  },
});
