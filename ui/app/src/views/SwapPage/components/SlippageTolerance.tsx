import { Button } from "@/components/Button/Button";

export const SlippageTolerance = (props: {
  slippage: string;
  onUpdate: (val: string) => any;
}) => {
  const handleOnInput = (e: Event) => {
    let v = (e.target as HTMLInputElement).value;

    if (isNaN(parseFloat(v)) || parseFloat(v) < 0) {
      v = "0";
    }

    const shouldTrimInput = parseFloat(v) > 999999999;
    const inputContainsManitssa = v.includes(".");

    // if value is an integer, slice off last digit
    if (shouldTrimInput && !inputContainsManitssa) {
      v = v.slice(0, -1);
    } else if (shouldTrimInput && inputContainsManitssa) {
      // trim value to an integer of 9 digits
      const decimalIndex = v.indexOf(".");
      v = v.slice(0, decimalIndex);
    }

    // update the input field value
    (e.target as HTMLInputElement).value = v;
  };

  return (
    <div class="flex items-center justify-center flex-row mt-[10px]">
      <div class="inline-flex mr-[10px] items-center">
        Slippage
        <Button.InlineHelp>
          Your transaction will revert if the price changes unfavorably by more
          than this percentage.
        </Button.InlineHelp>
      </div>
      <div class="flex flex-row items-center justify-center">
        {["0.5", "1.0", "1.5"].map((opt) => {
          return (
            <button
              onClick={(e) => {
                props.onUpdate(opt);
              }}
              class={`transition-all box-border text-white text-md mr-[7px] font-mono font-medium w-[57px] h-[33px] border-solid border-[1px] border-transparent rounded-[4px] ${
                +opt === +props.slippage
                  ? "bg-accent-gradient"
                  : "bg-gray-input border-gray-input_outline bg-gradient-to-b from-transparent to-transparent"
              }`}
            >
              {opt}%
            </button>
          );
        })}
      </div>
      <div class="flex flex-row items-center flex-nowrap box-border border border-solid border-transparent focus-within:border-white text-white font-mono group text-[20px] w-full bg-gray-input rounded-[4px]">
        <input
          type="number"
          step="0.1"
          class="px-[10px] pr-0 h-[31px] w-full align-middle bg-transparent outline-none font-mono text-right text-md font-semibold"
          value={props.slippage}
          onInput={(e) => {
            handleOnInput(e);
            props.onUpdate((e.target as HTMLInputElement).value);
          }}
        />
        <div class="pr-[10px] pointer-events-none select-none">%</div>
      </div>
    </div>
  );
};
