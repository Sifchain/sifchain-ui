import { Button } from "@/components/Button/Button";
import ResourcefulTextTransition from "@/components/ResourcefulTextTransition/ResourcefulTextTransition";
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
    return () => {
      const priceImpactPercentage = +(
        (+(props.liquidityProviderFee || 0) /
          +(props.minimumReceived?.split(" ")[0] || 0)) *
          100 || "0"
      );
      const rateOutUnitsPerInUnit = `${
        (props.priceRatio?.value &&
          !!+props.priceRatio.value &&
          parseFloat(props.priceRatio?.value || "0").toFixed(6)) ||
        "?"
      } ${props.toAsset?.value.displaySymbol.toUpperCase()}`;
      const rateInUnitsPerOutUnit = `${
        (props.priceRatio?.value &&
          !!+props.priceRatio.value &&
          (1 / parseFloat(props.priceRatio?.value || "0")).toFixed(6)) ||
        "?"
      } ${props.fromAsset?.value.displaySymbol.toUpperCase()}`;
      return (
        <div class="mt-[30px] w-full">
          <div class="flex  flex-row w-full">
            <div class="flex text-sm mr-[10px] items-start">
              <span class="text-[#919191]">Rate</span>
              {/* <Button.InlineHelp>
              Your transaction will revert if the price changes unfavorably by
              more than this percentage.
            </Button.InlineHelp> */}
            </div>
            <div class="flex flex-col w-full">
              <div class="flex flex-row justify-end items-start pl-[20px] text-right w-full text-md text-[#9D9F9F] font-mono font-medium">
                <span class="whitespace-nowrap">
                  <ResourcefulTextTransition
                    class="inline-block"
                    text={`1 ${props.fromAsset?.value.displaySymbol.toUpperCase()} = `}
                  />
                  <ResourcefulTextTransition
                    class="inline-block"
                    text={rateOutUnitsPerInUnit}
                  ></ResourcefulTextTransition>
                </span>
              </div>
              <div class="flex flex-row mt-[3px] justify-end items-start pl-[20px] text-right w-full text-sm text-[#E8E8E8] opacity-[0.33] font-mono font-medium">
                <span class="whitespace-nowrap">
                  <ResourcefulTextTransition
                    class="inline-block"
                    text={`1 ${props.toAsset?.value.displaySymbol.toUpperCase()} = `}
                  />
                  <ResourcefulTextTransition
                    class="inline-block"
                    text={rateInUnitsPerOutUnit}
                  ></ResourcefulTextTransition>
                </span>
              </div>
            </div>
          </div>{" "}
          <div class="flex flex-row w-full mt-[15px]">
            <div class="flex text-sm mr-[10px] w-1/2 items-start">
              <span class="text-[#919191]">Swap Fee</span>
              {/* <Button.InlineHelp>
              Your transaction will revert if the price changes unfavorably by
              more than this percentage.
            </Button.InlineHelp> */}
            </div>
            <div class="flex flex-col w-full">
              <div class="flex flex-row justify-end items-start pl-[20px] text-right w-full text-md text-[#9D9F9F] font-mono font-medium">
                {/* <ResourcefulTextTransition
                  class="inline-block"
                  text={`${
                    props.liquidityProviderFee || "?"
                  } ${props.toAsset?.value.displaySymbol.toUpperCase()}`}
                ></ResourcefulTextTransition> */}
                {/* {props.liquidityProviderFee}
                {props.minimumReceived} */}
                <ResourcefulTextTransition
                  class="inline-block"
                  text={`≈ ${
                    new Intl.NumberFormat("en-US", {
                      notation: "standard",
                      maximumFractionDigits: 4,
                    }).format(priceImpactPercentage) + "%"
                  }`}
                ></ResourcefulTextTransition>
              </div>
            </div>
          </div>
          {/* <div
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
        </div> */}
        </div>
      );
    };
  },
});
