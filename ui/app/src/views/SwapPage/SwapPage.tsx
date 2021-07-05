import { defineComponent, TransitionGroup } from "vue";
import NavIconVue from "@/componentsLegacy/NavSidePanel/NavIcon.vue";
import PageCard from '@/components/PageCard'
import { useSwapPageModule } from "./useSwapPageModule";
import { TokenInputGroup } from "./TokenInputGroup";
import { useSwapPageData } from "./useSwapPageData--old";
import { useCore } from "@/hooks/useCore";
import { IAsset } from "../../../../core/src";

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
      <PageCard heading='Swap' navIconId='swap'>
          <TokenInputGroup
            heading="From"
            key={data.fromSymbol.value}
            // key={data.modules.fromTokenInputGroup.state.symbol}
            onSetToMaxAmount={() => {
              data.handleFromMaxClicked();
              // data.mutations.updateActiveFieldType("from");
              // data.modules.fromTokenInputGroup.mutations.setAmountToMax();
            }}
            onInputAmount={(val) => {
              data.fromAmount.value = val;
              // data.mutations.updateActiveFieldType("from");
              // data.modules.fromTokenInputGroup.mutations.updateAmount(val);
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
              class="mt-[10px] p-[20px] bg-gradient-to-b from-accent-base to-accent-accent_gradient_to rounded-[4px]"
              src={require("@/assets/icons/interactive/swap.svg")}
            />
          </button>

          <TokenInputGroup
            heading="To"
            key={data.toSymbol.value}
            // key={data.modules.fromTokenInputGroup.state.symbol}
            onSetToMaxAmount={() => {
              // data.handleTo();
              // data.mutations.updateActiveFieldType("from");
              // data.modules.fromTokenInputGroup.mutations.setAmountToMax();
            }}
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
              ) || core.config.assets[0] as IAsset
            }
            formattedBalance={undefined}
          />
        <div class="p-[20px] bg-darkfill-base rounded-[10px] mt-[10px] w-full">
          <div class="w-full flex flex-col justify-between">
            <div class="text-left w-full text-[16px] text-white font-sans font-medium capitalize">
              Slippage Tolerance
            </div>
            <div class="flex items-center justify-center flex-row mt-[10px]">
              <div class="flex flex-row items-center justify-center">
                {["0.5", "1.0", "1.5"].map((opt) => {
                  return (
                    <button
                      onClick={(e) => {
                        data.slippage.value = opt;
                      }}
                      class={`box-border text-white text-[16px] mr-[7px] font-mono font-medium w-[57px] h-[33px] border-solid border-[1px] rounded-[4px] ${
                        +opt === +data.slippage.value
                          ? "bg-gradient-to-b from-accent-base to-accent-accent_gradient_to border-accent-base"
                          : "bg-darkfill-input border-darkfill-input_outline"
                      }`}
                    >
                      {opt}%
                    </button>
                  );
                })}
              </div>
              <div class="flex flex-row items-center flex-nowrap box-border border-[1px] border-solid text-white font-mono border-white text-[16px] w-full bg-darkfill-input rounded-[4px]">
                <input
                  type="number"
                  step="0.1"
                  class="px-[10px] pr-0 h-[31px] w-full align-middle bg-transparent outline-none  text-right"
                  value={data.slippage.value}
                  onInput={(e) => {
                    data.slippage.value = (e.target as HTMLInputElement).value;
                  }}
                />
                <div class="pr-[10px] pointer-events-none select-none">%</div>
              </div>
            </div>
          </div>
        </div> 
      </PageCard>
    );
  },
});
