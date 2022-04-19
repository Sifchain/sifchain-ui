import { computed, defineComponent, effect, PropType, Ref } from "vue";
import { IAsset } from "@sifchain/sdk";

import { Button } from "@/components/Button/Button";
import { TokenIcon } from "@/components/TokenIcon";

export const SwapDetails = defineComponent({
  props: {
    minimumReceived: String,
    priceImpact: String,
    liquidityProviderFee: String,
    priceRatio: Object as PropType<Ref<string>>,
    toAsset: Object as PropType<Ref<IAsset>>,
    fromAsset: Object as PropType<Ref<IAsset>>,
  },
  setup: (props) => {
    const priceRatios = computed(() => {
      if (!props.priceRatio?.value || !Number(props.priceRatio.value)) {
        return [(0).toFixed(6), (0).toFixed(6)] as const;
      }

      const ratio = parseFloat(props.priceRatio.value || "0");

      return [ratio.toFixed(6), (1 / ratio).toFixed(6)] as const;
    });

    return () => (
      <div class="mt-[10px] w-full">
        <div
          class={`
          bg-gray-base border-gray-input_outline box-border flex h-[49px] w-full
          items-center justify-center
          rounded-[6px] rounded-br-none rounded-bl-none border-[1px] border-b-[1px] border-solid
        `}
        >
          <div class="text-md w-full pl-[20px] text-left font-sans font-medium text-white">
            {props.toAsset?.value.displaySymbol.toUpperCase()} per{" "}
            {props.fromAsset?.value.displaySymbol.toUpperCase()}
          </div>
          <div class="text-md mr-[14px] flex w-full flex-row items-center justify-end pl-[20px] text-right font-mono font-medium text-white">
            <span class="mr-[4px] whitespace-nowrap">
              {priceRatios.value[0]}
            </span>
          </div>
        </div>
        <div
          class={`
          bg-gray-base border-gray-input_outline box-border flex h-[49px] w-full
          items-center justify-center
          border-[1px] border-b-[1px] border-t-0 border-solid 
        `}
        >
          <div class="text-md w-full pl-[20px] text-left font-sans font-medium text-white">
            {props.fromAsset?.value.displaySymbol.toUpperCase()} per{" "}
            {props.toAsset?.value.displaySymbol.toUpperCase()}
          </div>
          <div class="text-md mr-[14px] flex w-full flex-row items-center justify-end pl-[20px] text-right font-mono font-medium text-white">
            <span class="mr-[4px] whitespace-nowrap">
              {priceRatios.value[1]}
            </span>
          </div>
        </div>
        <div
          class={`
          bg-gray-base border-gray-input_outline box-border flex h-[49px] w-full
          items-center justify-center
          rounded-b-[6px] border-[1px] border-b-[1px] border-t-0 border-solid
        `}
        >
          <div class="text-md w-full pl-[20px] text-left font-sans font-medium capitalize text-white">
            Liquidity Provider Fee
            <Button.InlineHelp>
              This is the fee paid to the liquidity providers of this pool.
            </Button.InlineHelp>
          </div>
          <div class="text-md mr-[14px] flex w-full flex-row items-center justify-end pl-[20px] text-right font-mono font-medium text-white">
            <span class="mr-[4px]">{props.liquidityProviderFee}</span>
            {props.toAsset ? (
              <TokenIcon asset={props.toAsset} size={18}></TokenIcon>
            ) : (
              ""
            )}
          </div>
        </div>
      </div>
    );
  },
});
