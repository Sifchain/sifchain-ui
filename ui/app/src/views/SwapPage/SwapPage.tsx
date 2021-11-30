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
import { usePoolPageData } from "../PoolPage/usePoolPageData";
import { useRowanPrice } from "@/componentsLegacy/RowanPrice/useRowanPrice";
import { SlippageTolerance } from "./components/SlippageTolerance";

export default defineComponent({
  name: "SwapPage",
  data() {
    return {
      isInverted: false,
      showSettings: false,
    };
  },
  computed: {
    fromAmountUsd(): string {
      const lookup = this.poolData.poolStatLookup.value;
      if (
        !lookup ||
        !+this.fromAmount ||
        !this.fromAsset ||
        !this.rowanPrice.data.value
      )
        return "";

      const price =
        this.fromAsset.symbol.toLowerCase() === "rowan"
          ? +(this.rowanPrice.data.value || 0)
          : +lookup[this.fromAsset.symbol]?.priceToken;
      return (price * parseFloat(this.fromAmount)).toFixed(4);
    },
    toAmountUsd(): string {
      const lookup = this.poolData.poolStatLookup.value;
      if (!lookup || !+this.toAmount || !this.toAsset) return "";

      return (
        +lookup[this.toAsset.symbol]?.priceToken * +this.toAmount
      ).toFixed(4);
    },
  },
  setup() {
    const data = useSwapPageData();
    const swapIcon = ref<ComponentPublicInstance>();
    const appWalletPicker = useAppWalletPicker();
    const router = useRouter();

    const poolData = usePoolPageData();

    onMounted(() => {
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
      rowanPrice: useRowanPrice(),
      appWalletPicker: useAppWalletPicker(),
      poolData,
      swapIcon,
    };
  },
  render() {
    return (
      <Layout>
        <PageCard
          heading="Swap"
          iconName="navigation/swap"
          class="w-[531px]"
          headerAction={
            <AssetIcon
              icon="interactive/settings"
              size={24}
              class="opacity-50 cursor-pointer"
              onClick={() => (this.showSettings = !this.showSettings)}
            />
          }
        >
          {this.showSettings && (
            <SlippageTolerance
              slippage={this.slippage}
              onUpdate={(v) => {
                this.slippage = v;
              }}
            />
          )}
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
            footerContent={
              !!this.fromAmountUsd && (
                <div class="opacity-70">~$ {this.fromAmountUsd}</div>
              )
            }
          />
          <div
            class="flex relative items-center justify-center w-full overflow-hidden"
            style={{ zIndex: 2 }}
          >
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
            footerContent={
              !!this.toAmountUsd && (
                <div class="flex items-center justify-end">
                  <div class="opacity-70">~$ {this.toAmountUsd}</div>
                  <div class="opacity-50 ml-[2px]">({this.priceImpact}%)</div>
                </div>
              )
            }
          />
          <div class="font-mono p-[8px] whitespace-pre">
            {!+this.priceRatio ? (
              " "
            ) : (
              <div class="flex items-center justify-end">
                <div class="mr-[4px] opacity-70">
                  1 {this.toAsset.displaySymbol.toUpperCase()} ={" "}
                  {parseFloat(this.priceRatio || "0")}{" "}
                  {this.fromAsset.displaySymbol.toUpperCase()}
                </div>
                <Tooltip
                  interactive
                  placement="bottom"
                  arrow
                  key={new Date().getTime()}
                  maxWidth="none"
                  onShow={(instance) => {
                    instance.popper
                      .querySelector(".tippy-content")
                      ?.classList.add("tippy-content-reset");
                  }}
                  content={
                    <div class="w-[400px]">
                      <Form.Details details={this.details} />
                    </div>
                  }
                >
                  <AssetIcon
                    class="cursor-pointer"
                    icon="interactive/circle-info"
                    size={16}
                  />
                </Tooltip>
              </div>
            )}
          </div>
          <Button.CallToAction
            onClick={() => {
              if (!this.nextStepAllowed) {
                return this.appWalletPicker.show();
              }
              this.handleNextStepClicked();
            }}
            disabled={!this.nextStepAllowed}
            class="mt-[8px]"
          >
            {this.nextStepMessage}
          </Button.CallToAction>
          <div class="pb-4" />
        </PageCard>
      </Layout>
    );
  },
});
