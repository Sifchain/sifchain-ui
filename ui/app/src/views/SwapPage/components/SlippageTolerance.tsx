import { Button } from "@/components/Button/Button";

export const SlippageTolerance = (props: {
  slippage: string;
  onUpdate: (val: string) => any;
}) => {
  return (
    <div class="flex  flex-col mt-[20px] w-full">
      <div class="flex text-sm w-full mr-[10px] items-center">
        <span class="text-[#919191]">Slippage</span>
        <Button.InlineHelp>
          Your transaction will revert if the price changes unfavorably by more
          than this percentage.
        </Button.InlineHelp>
      </div>
      <div class="flex flex-row w-full mt-[10px]">
        <div class="flex flex-row">
          {["0.5", "1.0", "1.5"].map((opt) => {
            return (
              <button
                onClick={(e) => {
                  props.onUpdate(opt);
                }}
                class={`transition-all box-border font-bold text-md mr-[7px] font-mono w-[57px] h-[33px] border-solid border-[1px] border-transparent rounded-[4px] ${
                  +opt === +props.slippage
                    ? "bg-accent-gradient text-black"
                    : "bg-[#181D1F] text-accent-base "
                }`}
              >
                {opt}%
              </button>
            );
          })}
        </div>
        <div class="flex flex-row ml-[4px] items-center flex-nowrap box-border border border-solid border-transparent focus-within:border-white text-white font-mono group text-[20px] w-full bg-gray-input rounded-[4px]">
          <input
            type="number"
            step="0.1"
            class="px-[10px] pr-0 h-[31px] w-full align-middle bg-transparent outline-none font-mono text-right text-md font-medium"
            value={props.slippage}
            onInput={(e) => {
              props.onUpdate((e.target as HTMLInputElement).value);
            }}
          />
          <div class="pr-[10px] pointer-events-none select-none text-md font-medium">
            %
          </div>
        </div>
      </div>
    </div>
  );
};
