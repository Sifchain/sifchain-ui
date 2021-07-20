import { ButtonHTMLAttributes, SetupContext } from "vue";
export function _Pill(props: ButtonHTMLAttributes, ctx: SetupContext) {
  return (
    <button
      {...props}
      class={[
        "px-[10px] pt-[1px] font-semibold h-[20px] flex items-center justify-center border border-solid border-accent-base text-accent-dark text-sm tracking-[-0.01em] cursor-pointer rounded-lg hover:bg-accent-base hover:text-gray-300 z-[1]",
        props.class,
      ]}
    >
      {ctx.slots.default?.()}
    </button>
  );
}
