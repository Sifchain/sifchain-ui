import { Button } from "@/components/Button/Button";

export const SlippageTolerance = (props: {
  slippage: string;
  onUpdate: (val: string) => any;
}) => {
  return (
    <div class="flex flex-row items-center justify-center gap-2">
      <div class="inline-flex items-center py-1 px-1.5">
        Slippage
        <Button.InlineHelp>
          Your transaction will revert if the price changes unfavorably by more
          than this percentage.
        </Button.InlineHelp>
      </div>
      <div class="flex flex-row items-center justify-center gap-2">
        {["0.5", "1.0", "1.5"].map((opt) => (
          <button
            key={opt}
            onClick={(e) => {
              props.onUpdate(opt);
            }}
            class={[
              "text-md rounded border border-transparent py-1 px-1.5 font-mono font-medium text-white transition-all",
              Number(opt) === Number(props.slippage)
                ? "bg-accent-gradient"
                : "bg-gray-input border-gray-input_outline bg-gradient-to-b from-transparent to-transparent",
            ]}
          >
            {opt}%
          </button>
        ))}
      </div>
      <div class="bg-gray-input group box-border flex w-full flex-row flex-nowrap items-center rounded-[4px] border border-solid border-transparent font-mono text-[20px] text-white focus-within:border-white">
        <input
          type="number"
          step="0.1"
          class="text-md w-full bg-transparent py-1 px-1.5 text-right align-middle font-mono font-semibold outline-none"
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
