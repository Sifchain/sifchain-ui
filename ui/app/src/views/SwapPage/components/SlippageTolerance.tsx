export const SlippageTolerance = (props: {
  slippage: string;
  onUpdate: (val: string) => any;
}) => {
  return (
    <div class="p-[20px] bg-darkfill-base rounded-[10px] mt-[10px] w-full">
      <div class="w-full flex flex-col justify-between">
        <div class="text-left w-full text-[16px] text-white font-sans font-medium capitalize">
          Slippage Tolerance
        </div>
        <div class="flex items-center justify-center flex-row mt-[10px]">
          <div class="flex flex-row items-center justify-center">
            {["0.5", "1.0", "1.5"].map((opt) => {
              return (
                <button
                  onClick={(e) => {
                    props.onUpdate(opt);
                  }}
                  class={`transition-all box-border text-white text-[16px] mr-[7px] font-mono font-medium w-[57px] h-[33px] border-solid border-[1px] border-transparent rounded-[4px] ${
                    +opt === +props.slippage
                      ? "bg-accent-gradient"
                      : "bg-darkfill-input border-darkfill-input_outline bg-gradient-to-b from-transparent to-transparent"
                  }`}
                >
                  {opt}%
                </button>
              );
            })}
          </div>
          <div class="flex flex-row items-center flex-nowrap box-border border-[1px] border-solid text-white font-mono border-white text-[16px] w-full bg-darkfill-input rounded-[4px]">
            <input
              type="number"
              step="0.1"
              class="px-[10px] pr-0 h-[31px] w-full align-middle bg-transparent outline-none  text-right"
              value={props.slippage}
              onInput={(e) => {
                props.onUpdate((e.target as HTMLInputElement).value);
              }}
            />
            <div class="pr-[10px] pointer-events-none select-none">%</div>
          </div>
        </div>
      </div>
    </div>
  );
};
