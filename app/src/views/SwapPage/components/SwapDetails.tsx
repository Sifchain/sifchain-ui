import { Button } from "@/components/Button/Button";
import { TokenIcon } from "@/components/TokenIcon";
import { defineComponent, PropType, Ref } from "vue";
import { IAsset } from "../../../../../core/src";

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
    return () => (
      <div class="mt-[10px] w-full">
        <div
          class={`
          h-[49px] w-full flex justify-center items-center box-border
          bg-gray-base border-gray-input_outline
          border-[1px] border-b-[1px] border-solid rounded-[6px] rounded-br-none rounded-bl-none
        `}
        >
          <div class="pl-[20px] text-left w-full text-md text-white font-sans font-medium">
            {props.toAsset?.value.displaySymbol.toUpperCase()} per{" "}
            {props.fromAsset?.value.displaySymbol.toUpperCase()}
          </div>
          <div class="flex flex-row justify-end mr-[14px] items-center pl-[20px] text-right w-full text-md text-white font-mono font-medium">
            <span class="mr-[4px] whitespace-nowrap">
              {props.priceRatio?.value &&
                !!+props.priceRatio.value &&
                parseFloat(props.priceRatio?.value || "0").toFixed(6)}
            </span>
          </div>
        </div>
        <div
          class={`
          h-[49px] w-full flex justify-center items-center box-border
          bg-gray-base border-gray-input_outline
          border-[1px] border-b-[1px] border-t-0 border-solid 
        `}
        >
          <div class="pl-[20px] text-left w-full text-md text-white font-sans font-medium">
            {props.fromAsset?.value.displaySymbol.toUpperCase()} per{" "}
            {props.toAsset?.value.displaySymbol.toUpperCase()}
          </div>
          <div class="flex flex-row justify-end mr-[14px] items-center pl-[20px] text-right w-full text-md text-white font-mono font-medium">
            <span class="mr-[4px] whitespace-nowrap">
              {props.priceRatio?.value &&
                !!+props.priceRatio.value &&
                (1 / parseFloat(props.priceRatio?.value || "0")).toFixed(6)}
            </span>
          </div>
        </div>
        <div
          class={`
          h-[49px] w-full flex justify-center items-center box-border
          bg-gray-base border-gray-input_outline
          border-[1px] border-b-[1px] border-t-0 border-solid 
        `}
        >
          <div class="pl-[20px] text-left w-full text-md text-white font-sans font-medium capitalize">
            Minimum Received
            <Button.InlineHelp>
              This is the minimum amount of the to token you will receive,
              taking into consideration the acceptable slippage percentage you
              are willing to take on. This amount also already takes into
              consideration liquidity provider fees as well.
            </Button.InlineHelp>
          </div>
          <div class="flex flex-row justify-end mr-[14px] items-center pl-[20px] text-right w-full text-md text-white font-mono font-medium capitalize">
            <span class="mr-[4px]">{props.minimumReceived}</span>
            <TokenIcon asset={props.toAsset} size={18}></TokenIcon>
          </div>
        </div>
        <div
          class={`
          h-[49px] w-full flex justify-center items-center box-border
          bg-gray-base border-gray-input_outline
          border-[1px] border-b-[1px] border-t-0 border-solid 
        `}
        >
          <div class="pl-[20px] text-left w-full text-md text-white font-sans font-medium capitalize">
            Price Impact
            <Button.InlineHelp
              size={20}
              key={props.toAsset?.value.displaySymbol}
            >
              This is the percentage impact to the amount of{" "}
              {props.toAsset?.value.displaySymbol.toUpperCase()} in the
              liquidity pool based upon how much you are swapping for.
            </Button.InlineHelp>
          </div>
          <div class="flex flex-row justify-end mr-[14px] items-center pl-[20px] text-right w-full text-md text-white font-mono font-medium capitalize">
            <span class={["mr-[4px]"]}>{props.priceImpact}</span>
          </div>
        </div>
        <div
          class={`
          h-[49px] w-full flex justify-center items-center box-border
          bg-gray-base border-gray-input_outline
          border-[1px] border-b-[1px] border-t-0 border-solid rounded-b-[6px]
        `}
        >
          <div class="pl-[20px] text-left w-full text-md text-white font-sans font-medium capitalize">
            Liquidity Provider Fee
            <Button.InlineHelp>
              This is the fee paid to the liquidity providers of this pool.
            </Button.InlineHelp>
          </div>
          <div class="flex flex-row justify-end mr-[14px] items-center pl-[20px] text-right w-full text-md text-white font-mono font-medium">
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
