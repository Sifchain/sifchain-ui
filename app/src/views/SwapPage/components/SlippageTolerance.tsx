import { Button } from "~/components/Button/Button";

export const SlippageTolerance = (props: {
  slippage: string;
  onUpdate: (val: string) => any;
}) => {
  return (
    <div class="mt-[10px] flex flex-row items-center justify-center">
      <div class="mr-[10px] inline-flex items-center">
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
              class={`text-md mr-[7px] box-border h-[33px] w-[57px] rounded-[4px] border-[1px] border-solid border-transparent font-mono font-medium text-white transition-all ${
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
      <div class="bg-gray-input group box-border flex w-full flex-row flex-nowrap items-center rounded-[4px] border border-solid border-transparent font-mono text-[20px] text-white focus-within:border-white">
        <input
          type="number"
          step="0.1"
          class="text-md h-[31px] w-full bg-transparent px-[10px] pr-0 text-right align-middle font-mono font-semibold outline-none"
          value={props.slippage}
          onInput={(e) => {
            props.onUpdate((e.target as HTMLInputElement).value);
          }}
        />
        <div class="pointer-events-none select-none pr-[10px]">%</div>
      </div>
    </div>
  );
};
