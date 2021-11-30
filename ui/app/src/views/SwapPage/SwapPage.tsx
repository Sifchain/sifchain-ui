import { useAppWalletPicker } from "@/hooks/useAppWalletPicker";
import { useCore } from "@/hooks/useCore";
import { usePublicPoolsSubscriber } from "@/hooks/usePoolsSubscriber";
import { defineComponent } from "@vue/runtime-core";
import { ComponentPublicInstance, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useSwapPageData } from "./useSwapPageData";
import Layout from "@/componentsLegacy/Layout/Layout";
import PageCard from "@/components/PageCard";
import { TokenInputGroup } from "./components/TokenInputGroup";
import AssetIcon from "@/components/AssetIcon";
import { Button } from "@/components/Button/Button";
import { SwapDetails } from "./components/SwapDetails";
import { Tooltip } from "@/components/Tooltip";
import { Form } from "@/components/Form";

export default defineComponent({
  name: "SwapPage",
  data() {
    return {
      isInverted: false,
    };
  },
  setup() {
    const data = useSwapPageData();
    const swapIcon = ref<ComponentPublicInstance>();
    const appWalletPicker = useAppWalletPicker();
    const router = useRouter();

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
    return {
      ...useSwapPageData(),
      swapIcon,
    };
  },
  render() {
    return (
      <Layout>
        <PageCard heading="Swap" iconName="navigation/swap" class="w-[531px]">
          <TokenInputGroup
            onSelectAsset={(asset) => {
              this.fromSymbol.value = asset.symbol;
            }}
            class="overflow-hidden mb-[-12px]"
            tokenIconUrl={this.fromTokenIconUrl ?? ""}
            onFocus={() => this.handleFromFocused()}
            onBlur={() => this.handleBlur()}
            heading="From"
            // key={data.fromSymbol.value}
            onSetToMaxAmount={() => {
              this.handleFromMaxClicked();
            }}
            onInputAmount={(val) => {
              this.fromAmount = val;
            }}
            amount={this.fromAmount}
            asset={this.fromAsset}
            formattedBalance={this.formattedFromTokenBalance || undefined}
          />
          <div class="flex relative items-center justify-center w-full overflow-hidden">
            <button
              // onMouseover={() => {
              //   console.log("m2");
              // }}
              // onMouseout={() => {
              //   console.log("m1");
              //   isHoveringOverInvertButtonRef.value = false;
              // }}
              class="origin-center flex items-center relative bg-gray-base border-gray-input_outline py-[4px] px-[9px] box-content border-[1px] rounded-[10px] hover:border-accent-base"
              key="button"
              onClick={async (e: MouseEvent) => {
                this.handleArrowClicked();
                this.isInverted = !this.isInverted;
              }}
            >
              <div
                style={{
                  transform: `scaleY(${this.isInverted ? -1 : 1})`,
                }}
              >
                <AssetIcon
                  size={22}
                  class=" text-accent-base"
                  icon="navigation/swap"
                ></AssetIcon>
              </div>
            </button>
          </div>
          <TokenInputGroup
            onSelectAsset={(asset) => {
              this.toSymbol = asset.symbol;
            }}
            class="overflow-hidden mt-[-12px] "
            tokenIconUrl={this.toTokenIconUrl ?? ""}
            onFocus={() => this.handleToFocused()}
            onBlur={() => this.handleBlur()}
            heading="To"
            // key={data.toSymbol.value}
            // key={data.modules.fromTokenInputGroup.state.symbol}
            onInputAmount={(val) => {
              this.toAmount = val;
            }}
            amount={this.toAmount}
            asset={this.toAsset}
            formattedBalance={this.formattedToTokenBalance || undefined}
          />
          <div class="font-mono h-[40px] pt-[8px]">
            {!!+this.priceRatio && (
              <div class="flex items-center justify-end">
                <div class="mr-[4px] opacity-50">
                  1 {this.toAsset.displaySymbol.toUpperCase()} ={" "}
                  {parseFloat(this.priceRatio || "0")}{" "}
                  {this.fromAsset.displaySymbol.toUpperCase()}
                </div>
                <Tooltip
                  interactive
                  placement="bottom"
                  arrow
                  maxWidth="none"
                  class="!p-0"
                  content={
                    <div class="cursor-pointer w-[400px]">
                      <Form.Details
                        key={new Date().getTime()}
                        details={this.details}
                      />
                    </div>
                  }
                >
                  <AssetIcon icon="interactive/circle-info" size={16} />
                </Tooltip>
              </div>
            )}
          </div>
        </PageCard>
      </Layout>
    );
  },
});
