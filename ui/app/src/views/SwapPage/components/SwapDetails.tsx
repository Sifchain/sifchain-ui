import { TokenIcon } from "@/components/TokenIcon";
import { defineComponent, PropType, Ref, ref } from "vue";
import { IAsset } from "../../../../../core/src";

export const SwapDetails = defineComponent({
  props: {
    price: String,
    minimumReceived: String,
    priceImpact: String,
    liquidityProviderFee: String,
    asset: Object as PropType<Ref<IAsset>>,
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
          <div class="pl-[20px] text-left w-full text-md text-white font-sans font-medium capitalize">
            Price
          </div>
          <div class="flex flex-row justify-end mr-[14px] items-center pl-[20px] text-right w-full text-md text-white font-mono font-medium">
            <span class="mr-[4px] whitespace-nowrap">{props.price}</span>
            {/* <img class="h-[18px]" src={props.toTokenImageUrl} alt="" /> */}
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
          </div>
          <div class="flex flex-row justify-end mr-[14px] items-center pl-[20px] text-right w-full text-md text-white font-mono font-medium capitalize">
            <span class="mr-[4px]">{props.minimumReceived}</span>
            <TokenIcon asset={ref(props.asset)} size={18}></TokenIcon>
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
          </div>
          <div class="flex flex-row justify-end mr-[14px] items-center pl-[20px] text-right w-full text-md text-white font-mono font-medium capitalize">
            <span class="mr-[4px]">{props.priceImpact}</span>
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
          </div>
          <div class="flex flex-row justify-end mr-[14px] items-center pl-[20px] text-right w-full text-md text-white font-mono font-medium">
            <span class="mr-[4px]">{props.liquidityProviderFee}</span>
            {props.asset ? (
              <TokenIcon asset={props.asset} size={18}></TokenIcon>
            ) : (
              ""
            )}
          </div>
        </div>
      </div>
    );
  },
});
